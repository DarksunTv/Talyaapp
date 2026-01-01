// Measurement Calculation Utilities for Konva Canvas
export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  points: Point[];
  label?: string;
}

export interface MeasurementData {
  polygons: Polygon[];
  scale?: number; // pixels per foot
  wasteFactor: number; // default 0.10 (10%)
}

/**
 * Calculate area of a polygon using Shoelace formula
 * @param points Array of points forming the polygon
 * @returns Area in square pixels
 */
export function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/**
 * Calculate perimeter of a polygon
 * @param points Array of points forming the polygon
 * @returns Perimeter in pixels
 */
export function calculatePerimeter(points: Point[]): number {
  if (points.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  return perimeter;
}

/**
 * Convert pixel area to square feet
 * @param pixelArea Area in square pixels
 * @param scale Pixels per foot
 * @returns Area in square feet
 */
export function pixelsToSquareFeet(pixelArea: number, scale: number): number {
  if (scale <= 0) return 0;
  return pixelArea / (scale * scale);
}

/**
 * Calculate total square footage with waste factor
 * @param measurements Measurement data with polygons
 * @returns Total square footage including waste
 */
export function calculateTotalSquareFeet(measurements: MeasurementData): number {
  const scale = measurements.scale || 1;
  let totalArea = 0;

  measurements.polygons.forEach((polygon) => {
    const pixelArea = calculatePolygonArea(polygon.points);
    const sqft = pixelsToSquareFeet(pixelArea, scale);
    totalArea += sqft;
  });

  // Apply waste factor
  const wasteFactor = measurements.wasteFactor || 0.10;
  return totalArea * (1 + wasteFactor);
}

/**
 * Calculate distance between two points
 * @param p1 First point
 * @param p2 Second point
 * @returns Distance in pixels
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert pixels to feet using scale
 * @param pixels Distance in pixels
 * @param scale Pixels per foot
 * @returns Distance in feet
 */
export function pixelsToFeet(pixels: number, scale: number): number {
  if (scale <= 0) return 0;
  return pixels / scale;
}

/**
 * Format square footage for display
 * @param sqft Square footage
 * @returns Formatted string
 */
export function formatSquareFeet(sqft: number): string {
  return `${sqft.toFixed(2)} sq ft`;
}

/**
 * Format linear feet for display
 * @param feet Linear feet
 * @returns Formatted string
 */
export function formatFeet(feet: number): string {
  return `${feet.toFixed(2)} ft`;
}

/**
 * Calculate roof pitch from rise and run
 * @param rise Vertical rise
 * @param run Horizontal run
 * @returns Pitch as ratio (e.g., "6/12")
 */
export function calculatePitch(rise: number, run: number = 12): string {
  if (run === 0) return '0/12';
  const normalizedRise = (rise / run) * 12;
  return `${normalizedRise.toFixed(1)}/12`;
}

/**
 * Adjust square footage for pitch
 * @param sqft Flat square footage
 * @param pitch Roof pitch (e.g., "6/12")
 * @returns Adjusted square footage
 */
export function adjustForPitch(sqft: number, pitch: string): number {
  const [rise] = pitch.split('/').map(Number);
  if (!rise) return sqft;

  // Calculate pitch factor using Pythagorean theorem
  const pitchFactor = Math.sqrt(1 + Math.pow(rise / 12, 2));
  return sqft * pitchFactor;
}

/**
 * Snap point to grid
 * @param point Point to snap
 * @param gridSize Grid size in pixels
 * @returns Snapped point
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Check if point is inside polygon
 * @param point Point to check
 * @param polygon Polygon points
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}
