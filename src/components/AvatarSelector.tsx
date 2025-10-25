import { useState } from 'react';
import { AVATARS, type Avatar } from '@/data/avatars';
import { MaterialIcon } from '@shared/ui';
import '@/styles/ui.css';

interface AvatarSelectorProps {
  currentAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export default function AvatarSelector({ currentAvatarId, onSelect }: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Avatar['category'] | 'all'>('all');

  const categories: Array<{ value: Avatar['category'] | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'Wszystkie', icon: 'apps' },
    { value: 'animals', label: 'Zwierzęta', icon: 'pets' },
    { value: 'food', label: 'Jedzenie', icon: 'fastfood' },
    { value: 'sports', label: 'Sport', icon: 'sports_soccer' },
    { value: 'objects', label: 'Przedmioty', icon: 'category' },
    { value: 'symbols', label: 'Symbole', icon: 'star' },
  ];

  const filteredAvatars = selectedCategory === 'all' 
    ? AVATARS 
    : AVATARS.filter(avatar => avatar.category === selectedCategory);

  return (
    <div className="avatar-selector-container">
      {/* Kategorie */}
      <div className="avatar-categories">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <MaterialIcon icon={cat.icon} size={20} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid avatarów */}
      <div className="avatars-grid">
        {filteredAvatars.map((avatar) => (
          <button
            key={avatar.id}
            className={`avatar-option ${currentAvatarId === avatar.id ? 'selected' : ''}`}
            onClick={() => onSelect(avatar.id)}
            title={avatar.name}
          >
            <MaterialIcon icon={avatar.icon} size={32} />
          </button>
        ))}
      </div>
    </div>
  );
}
