import { useStore } from '@/app/store/useCanvasStore';
import {
  getContrastYIQ,
  colorCombinations,
  handleChangeColorWithCombination
} from '@/ui/nodes/common/CommonNodeFunctions';

export const useBackgroundColorChange = (
  nodeId: string,
  setBackgroundColor: (color: string) => void,
  setTextColor: (color: string) => void
) => {
  const handleBackgroundColorChange = (color: { hex: string }) => {
    const selectedCombination = colorCombinations.find(
      (combination) =>
        combination.background.toLowerCase() === color.hex.toLowerCase()
    );
    if (selectedCombination) {
      setTextColor(selectedCombination.text);
      handleChangeColorWithCombination(
        nodeId,
        selectedCombination.background,
        selectedCombination.text,
        setBackgroundColor
      );
    } else {
      const calculatedTextColor = getContrastYIQ(color.hex);
      setTextColor(calculatedTextColor);
      handleChangeColorWithCombination(
        nodeId,
        color.hex,
        calculatedTextColor,
        setBackgroundColor
      );
    }
  };

  return handleBackgroundColorChange;
};
