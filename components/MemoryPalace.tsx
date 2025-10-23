import React, { useState } from 'react';
import Button from './common/Button';
import { PalaceIcon } from './icons/PalaceIcon';
import { RoomIcon } from './icons/RoomIcon';
import { MemoryIcon } from './icons/MemoryIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Memory {
  id: number;
  title: string;
  description: string;
}

interface Room {
  id: number;
  name: string;
  memories: Memory[];
}

const MemoryPalace: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newMemory, setNewMemory] = useState<{ [key: number]: { title: string; description: string } }>({});

  const addRoom = () => {
    if (newRoomName.trim()) {
      setRooms([...rooms, { id: Date.now(), name: newRoomName, memories: [] }]);
      setNewRoomName('');
    }
  };

  const deleteRoom = (roomId: number) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  const addMemory = (roomId: number) => {
    const memoryContent = newMemory[roomId];
    if (memoryContent && memoryContent.title.trim()) {
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            memories: [...room.memories, { id: Date.now(), ...memoryContent }],
          };
        }
        return room;
      });
      setRooms(updatedRooms);
      setNewMemory({ ...newMemory, [roomId]: { title: '', description: '' } });
    }
  };

  const deleteMemory = (roomId: number, memoryId: number) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          memories: room.memories.filter(mem => mem.id !== memoryId),
        };
      }
      return room;
    });
    setRooms(updatedRooms);
  };
  
  const handleMemoryInputChange = (roomId: number, field: 'title' | 'description', value: string) => {
    setNewMemory({
        ...newMemory,
        [roomId]: {
            ...newMemory[roomId],
            [field]: value,
        }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-cyber-accent flex items-center justify-center gap-2">
          <PalaceIcon /> Your Memory Palace
        </h2>
        <p className="text-cyber-text-secondary mt-2">Build a safe space in your mind. Create rooms and store memories to anchor yourself.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-cyber-secondary border border-cyber-accent rounded-lg">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Name this new sanctuary..."
          className="w-full flex-grow bg-cyber-primary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner"
          onKeyPress={(e) => e.key === 'Enter' && addRoom()}
        />
        <Button onClick={addRoom} disabled={!newRoomName.trim()}>
          <RoomIcon /> Create Room
        </Button>
      </div>

      <div className="space-y-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-cyber-secondary border border-cyber-accent rounded-lg p-4 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-cyber-accent flex items-center gap-2">
                <RoomIcon /> {room.name}
              </h3>
              <button onClick={() => deleteRoom(room.id)} className="text-cyber-error hover:text-red-500 transition-colors">
                <TrashIcon />
              </button>
            </div>

            <div className="space-y-3">
                {room.memories.map(memory => (
                    <div key={memory.id} className="bg-cyber-primary p-3 rounded-md border-l-4 border-cyber-accent flex justify-between items-start">
                        <div>
                            <p className="font-bold text-cyber-text">{memory.title}</p>
                            <p className="text-sm text-cyber-text-secondary">{memory.description}</p>
                        </div>
                        <button onClick={() => deleteMemory(room.id, memory.id)} className="text-cyber-error hover:text-red-500 transition-colors flex-shrink-0 ml-4">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-cyber-secondary-dark flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Anchor a memory (e.g., 'Feeling safe')"
                    value={newMemory[room.id]?.title || ''}
                    onChange={(e) => handleMemoryInputChange(room.id, 'title', e.target.value)}
                    className="w-full bg-cyber-primary border border-cyber-accent text-cyber-text font-mono p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-cyber-accent-hover"
                />
                <textarea
                    placeholder="Describe it... (optional)"
                    value={newMemory[room.id]?.description || ''}
                    onChange={(e) => handleMemoryInputChange(room.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-cyber-primary border border-cyber-accent text-cyber-text font-mono p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-cyber-accent-hover resize-y"
                />
                <Button onClick={() => addMemory(room.id)} disabled={!newMemory[room.id]?.title.trim()} variant="secondary" className="self-end mt-2">
                    <MemoryIcon /> Add Memory
                </Button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
            <p className="text-center text-cyber-text-secondary italic">Your palace awaits. Create your first room to begin.</p>
        )}
      </div>
    </div>
  );
};

export default MemoryPalace;