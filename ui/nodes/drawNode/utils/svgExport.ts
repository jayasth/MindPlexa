export function exportSVG(canvas: HTMLCanvasElement | undefined): string {
  if (!canvas) return '';

  const serializer = new XMLSerializer();
  const svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const foreignObject = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'foreignObject'
  );
  const imgElement = document.createElementNS(
    'http://www.w3.org/1999/xhtml',
    'img'
  ) as HTMLImageElement;

  svgElement.setAttribute('width', canvas.width.toString());
  svgElement.setAttribute('height', canvas.height.toString());
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  imgElement.setAttribute('width', '100%');
  imgElement.setAttribute('height', '100%');
  imgElement.src = canvas.toDataURL('image/png');

  foreignObject.appendChild(imgElement);
  svgElement.appendChild(foreignObject);

  return `data:image/svg+xml;base64,${btoa(serializer.serializeToString(svgElement))}`;
}
