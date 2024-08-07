import React from 'react';
import AIGeneratorModalV1 from './AIGeneratorModalV1';
import AIGeneratorModalV2 from './AIGeneratorModalV2';

interface AIGeneratorControllerProps {
  version: 'v1' | 'v2' | null;
  onClose: () => void;
}

const AIGeneratorController: React.FC<AIGeneratorControllerProps> = ({
  version,
  onClose
}) => {
  if (!version) return null;

  const ModalComponent =
    version === 'v1' ? AIGeneratorModalV1 : AIGeneratorModalV2;

  return <ModalComponent onClose={onClose} />;
};

export default AIGeneratorController;
