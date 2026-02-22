import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Timer } from '../components/Timer';
import { Inventory } from '../components/Inventory';
import { ClueCard } from '../components/ClueCard';
import Modal from '../components/Modal';

interface EvidenceItem {
  id: string;
  type: 'suspect' | 'victim' | 'document' | 'cctv' | 'newspaper';
  name: string;
  x: number;
  y: number;
  content?: string;
}

interface Connection {
  from: string;
  to: string;
}

const initialEvidence: EvidenceItem[] = [
  { id: 'victim1', type: 'victim', name: 'Victim Photo', x: 400, y: 200, content: 'John Doe, found at 2:17 AM' },
  { id: 'suspect1', type: 'suspect', name: 'Suspect A', x: 200, y: 150, content: 'Known associate' },
  { id: 'suspect2', type: 'suspect', name: 'Suspect B', x: 600, y: 150, content: 'Last seen at scene' },
  { id: 'suspect3', type: 'suspect', name: 'Suspect C', x: 400, y: 350, content: 'Phone records match' },
  { id: 'cctv1', type: 'cctv', name: 'CCTV Footage', x: 150, y: 300, content: 'Shows figure at 2:15 AM' },
  { id: 'cctv2', type: 'cctv', name: 'Street Camera', x: 650, y: 300, content: 'Vehicle departing' },
  { id: 'doc1', type: 'document', name: 'Phone Records', x: 300, y: 450, content: 'Call to 555-0142 at 2:00 AM' },
  { id: 'doc2', type: 'document', name: 'Bank Statement', x: 500, y: 450, content: 'Large withdrawal' },
  { id: 'news1', type: 'newspaper', name: 'Article 1', x: 100, y: 500, content: 'Meeting at 41° north mentioned' },
];

function EvidenceWallRoom() {
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoomedItem, setZoomedItem] = useState<EvidenceItem | null>(null);
  const [solved, setSolved] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    const rect = wallRef.current?.getBoundingClientRect();

    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setEvidence(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, x, y } : item
        )
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      if (connectingFrom === null) {
        setConnectingFrom(itemId);
      } else {
        if (connectingFrom !== itemId) {
          setConnections(prev => [...prev, { from: connectingFrom, to: itemId }]);
        }
        setConnectingFrom(null);
      }
    } else {
      const item = evidence.find(e => e.id === itemId);
      if (item) {
        setZoomedItem(item);
      }
    }
  };

  const clearConnections = () => {
    setConnections([]);
    setConnectingFrom(null);
  };

  const checkTheory = () => {
    const correctConnections = [
      { from: 'victim1', to: 'cctv1' },
      { from: 'cctv1', to: 'suspect3' },
      { from: 'suspect3', to: 'doc1' },
    ];

    const hasAllCorrect = correctConnections.every(correct =>
      connections.some(conn =>
        (conn.from === correct.from && conn.to === correct.to) ||
        (conn.from === correct.to && conn.to === correct.from)
      )
    );

    if (hasAllCorrect && connections.length >= 3) {
      setSolved(true);
    }
  };

  const getItemPosition = (itemId: string) => {
    const item = evidence.find(e => e.id === itemId);
    return item ? { x: item.x, y: item.y } : { x: 0, y: 0 };
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-[#141419] border-b-2 border-[#B11226]/30">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#B11226]/20 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <ClueCard text="Truth connects where lies intersect." />
        </div>

        <Timer />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1F] to-[#0B0B0E]">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-[#C6A15B] rounded-full blur-[150px] opacity-20" />
        </div>

        <div
          ref={wallRef}
          className="relative h-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const from = getItemPosition(conn.from);
              const to = getItemPosition(conn.to);
              return (
                <line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#B11226"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {evidence.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onClick={(e) => handleItemClick(item.id, e)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${connectingFrom === item.id ? 'ring-4 ring-[#B11226]' : ''
                }`}
              style={{ left: item.x, top: item.y }}
            >
              <div className={`px-4 py-3 rounded border-2 transition-all hover:shadow-[0_0_20px_rgba(177,18,38,0.4)] ${item.type === 'victim' ? 'bg-[#B11226]/20 border-[#B11226]' :
                item.type === 'suspect' ? 'bg-[#141419] border-[#EDEDED]/30' :
                  item.type === 'cctv' ? 'bg-[#C6A15B]/10 border-[#C6A15B]' :
                    'bg-[#0B0B0E] border-[#A3A3A3]'
                }`}>
                <div className="text-sm font-semibold whitespace-nowrap">{item.name}</div>
              </div>
            </div>
          ))}

          {solved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#B11226] text-white px-12 py-8 rounded-lg text-3xl font-bold shadow-[0_0_50px_rgba(177,18,38,0.8)] animate-pulse">
                COORDINATE: 41.7
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-24 right-6 flex flex-col gap-3">
          <button
            onClick={clearConnections}
            className="px-6 py-3 bg-[#141419] border-2 border-[#B11226]/50 hover:bg-[#B11226]/20 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear Board
          </button>
          <button
            onClick={checkTheory}
            className="px-6 py-3 bg-[#B11226] hover:bg-[#8B0E1D] transition-all font-semibold"
          >
            Check Theory
          </button>
          <p className="text-xs text-[#A3A3A3] text-center">
            Shift + Click to connect
          </p>
        </div>
      </div>

      <Inventory />

      <Modal
        isOpen={zoomedItem !== null}
        onClose={() => setZoomedItem(null)}
        title={zoomedItem?.name}
      >
        {zoomedItem && (
          <div className="space-y-4">
            <div className="bg-[#0B0B0E] p-8 rounded border border-[#B11226]/30 min-h-[300px] flex items-center justify-center">
              <p className="text-lg text-[#EDEDED] text-center leading-relaxed">
                {zoomedItem.content}
              </p>
            </div>
            {zoomedItem.id === 'news1' && (
              <div className="text-[#B11226] text-center font-semibold">
                Hidden Clue: "COUNT WHAT ISN'T THERE"
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EvidenceWallRoom;
