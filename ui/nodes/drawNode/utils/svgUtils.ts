export function getSvgString(canvas: HTMLCanvasElement | undefined): string {
  if (!canvas) return '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');

  svg.setAttribute('width', canvas.width.toString());
  svg.setAttribute('height', canvas.height.toString());
  img.setAttribute('width', canvas.width.toString());
  img.setAttribute('height', canvas.height.toString());
  img.setAttribute('href', canvas.toDataURL('image/png'));

  svg.appendChild(img);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}
