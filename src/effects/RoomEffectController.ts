import {
    fadeOverlay,
    flickerLights,
    spawnDustParticles,
    subtleScreenShake,
    playAmbientSound,
    stopAmbientSound,
    addVignette,
    removeVignette
} from './effectUtils';

export type RoomType = 'piano' | 'cipher' | 'furniture' | 'clock' | 'wall';

class RoomEffectController {
    roomType: RoomType;
    state: string;
    private cleanupDust: (() => void) | null = null;
    public container: HTMLElement | null = null;

    constructor(roomType: RoomType) {
        this.roomType = roomType;
        this.state = "entry";
    }

    setContainer(container: HTMLElement | null) {
        this.container = container;
    }

    triggerEntry() {
        this.state = "entry";
        addVignette();

        switch (this.roomType) {
            case 'piano':
                playAmbientSound('piano_hum');
                this.cleanupDust = spawnDustParticles(this.container || document.body);
                break;
            case 'cipher':
                playAmbientSound('low_creak');
                break;
            case 'furniture':
                // Handled in component
                break;
            case 'clock':
                playAmbientSound('loud_ticking', 0.8);
                break;
            case 'wall':
                playAmbientSound('rain', 0.4);
                break;
        }
    }

    triggerSignatureEffect() {
        this.state = "signature";
        switch (this.roomType) {
            case 'piano':
                // Triggered in component via state/classes
                break;
            case 'cipher':
                this.cleanupDust = spawnDustParticles(this.container || document.body);
                break;
            case 'furniture':
                // Shadow move handled via component classes
                break;
            case 'clock':
                // Red line logic
                break;
            case 'wall':
                break;
        }
    }

    triggerProgressEffect(progress: number) {
        this.state = "progress";
        switch (this.roomType) {
            case 'piano':
                break;
            case 'cipher':
                break;
            case 'furniture':
                subtleScreenShake();
                break;
            case 'clock':
                break;
            case 'wall':
                subtleScreenShake();
                break;
        }
    }

    triggerErrorEffect() {
        if (this.roomType === 'piano') {
            fadeOverlay('rgba(0,0,0,0.5)', 300);
            playAmbientSound('discordant_piano');
        } else if (this.roomType === 'cipher') {
            // pause crack handled in component
        }
    }

    triggerSolve() {
        this.state = "solve";
        switch (this.roomType) {
            case 'piano':
                fadeOverlay('rgba(198, 161, 91, 0.4)', 1500); // Golden pulse
                break;
            case 'cipher':
                subtleScreenShake();
                fadeOverlay('rgba(255, 255, 255, 0.2)', 500); // Dust burst overlay
                break;
            case 'furniture':
                subtleScreenShake();
                break;
            case 'clock':
                flickerLights(1, 3);
                break;
            case 'wall':
                fadeOverlay('rgba(0,0,0,1)', 2000);
                break;
        }
    }

    triggerExit() {
        this.state = "exit";
        removeVignette();
        if (this.cleanupDust) {
            this.cleanupDust();
            this.cleanupDust = null;
        }

        switch (this.roomType) {
            case 'piano':
                stopAmbientSound('piano_hum');
                break;
            case 'cipher':
                stopAmbientSound('low_creak');
                break;
            case 'furniture':
                break;
            case 'clock':
                stopAmbientSound('loud_ticking');
                break;
            case 'wall':
                stopAmbientSound('rain');
                break;
        }
    }
}

export default RoomEffectController;
