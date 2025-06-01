
export function calculateTriangleVertices(a, b, c) {
  if (a + b <= c || a + c <= b || b + c <= a) {
    return null;
  }

  // Calculate vertices using law of cosines
  const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b));
  return [
    { x: 0, y: 0 },          // Vertex 1
    { x: a, y: 0 },          // Vertex 2
    { 
      x: b * Math.cos(angleC), 
      y: b * Math.sin(angleC)  // Vertex 3
    }
  ];
}

// For trapezoid vertices if needed later
export function calculateTrapezoidVertices(base1, base2, height) {
  const offset = (base1 - base2) / 2;
  return [
    { x: 0, y: 0 },
    { x: base1, y: 0 },
    { x: base1 - offset, y: height },
    { x: offset, y: height }
  ];
}