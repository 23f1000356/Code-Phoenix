import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export function VoiceChat() {
    const { isMultiplayer, teamCode, socket, players, myId } = useGame();
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});

    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const audioContextRef = useRef<AudioContext | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMultiplayer || !teamCode || !socket || isDeafened) return;

        navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
            if (isMuted) {
                mediaStream.getAudioTracks().forEach(track => track.enabled = false);
            }
            setStream(mediaStream);

            // Establish Audio Context for volume detection if desired, or simpler WebRTC
            players.forEach(p => {
                if (p.id !== myId && !peersRef.current[p.id]) {
                    createPeerConnection(p.id, mediaStream);
                }
            });
        }).catch(err => {
            console.error("Failed to acquire microphone", err);
        });

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());
            peersRef.current = {};
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [isMultiplayer, teamCode, players, isDeafened]);

    useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted, stream]);

    const createPeerConnection = (targetId: string, currentStream: MediaStream) => {
        if (!socket) return;
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[targetId] = pc;

        currentStream.getTracks().forEach(track => {
            pc.addTrack(track, currentStream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', { targetId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            let audioEl = document.getElementById(`audio-${targetId}`) as HTMLAudioElement;
            if (!audioEl) {
                audioEl = document.createElement('audio');
                audioEl.id = `audio-${targetId}`;
                audioEl.autoplay = true;
                if (containerRef.current) {
                    containerRef.current.appendChild(audioEl);
                }
            }
            if (audioEl.srcObject !== event.streams[0]) {
                audioEl.srcObject = event.streams[0];
            }
        };

        pc.onnegotiationneeded = async () => {
            try {
                // Ensure the smaller ID creates the offer to avoid glaring collisions
                if (myId < targetId) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtc_offer', { targetId, offer });
                }
            } catch (e) {
                console.error('Error negotiating WebRTC', e);
            }
        };
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('webrtc_offer', async ({ senderId, offer }) => {
            let pc = peersRef.current[senderId];
            if (!pc && stream) {
                createPeerConnection(senderId, stream);
                pc = peersRef.current[senderId];
            }
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', { targetId: senderId, answer });
            }
        });

        socket.on('webrtc_answer', async ({ senderId, answer }) => {
            const pc = peersRef.current[senderId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('webrtc_ice_candidate', async ({ senderId, candidate }) => {
            const pc = peersRef.current[senderId];
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off('webrtc_offer');
            socket.off('webrtc_answer');
            socket.off('webrtc_ice_candidate');
        };
    }, [socket, stream]);

    if (!isMultiplayer) return null;

    return (
        <div className="pointer-events-auto flex items-center gap-2 bg-[#141419]/90 backdrop-blur-md p-2 rounded-full border border-white/5">
            <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isMuted ? 'bg-[#B11226]/20 text-[#B11226]' : 'hover:bg-white/10 text-white'}`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDeafened ? 'bg-[#B11226]/20 text-[#B11226]' : 'hover:bg-white/10 text-white'}`}
                title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
            >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div ref={containerRef} className="hidden" />
        </div>
    );
}
