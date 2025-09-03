export type Medium = {
  name: string;
  nd: number;
  Abbe?: number;
  sellmeier?: { B1: number; B2: number; B3: number; C1: number; C2: number; C3: number };
};

export type SurfaceGeom =
  | { kind: 'sphere'; R: number }
  | { kind: 'asphere'; R: number; K: number; a2?: number; a4?: number; a6?: number }
  | { kind: 'toric'; Raxis: number; Rpower: number; axisDeg: number };

export type Aperture = { type: 'circular' | 'box' | 'ellipse'; dia: number; sizeA?: number; sizeB?: number };

export type Surface = {
  z: number;
  geom: SurfaceGeom;
  aperture: Aperture;
  mediumIn: string;
  mediumOut: string;
  coating?: { Ravg: number };
  label?: string;
};

export type Gap = { kind: 'gap'; zStart: number; zEnd: number; medium: string; label?: string };
export type Stop = { kind: 'stop'; z: number; diameter: number; label?: string };

export type LensElement = { kind: 'lens'; front: Surface; back: Surface; bodyMedium: string; label?: string };
export type Element = LensElement | Gap | Stop;

export type OpticalSystem = {
  elements: Element[];
  sensor?: { z: number; width: number; height: number; px: number; py: number; medium: string };
  object?: { z: number; size: number; textureUrl?: string };
  settings: {
    spectral: { mode: 'abbe' | 'sellmeier'; samples: number };
    sampling: { spp: number; pupilSamples: number; fieldSamples: number };
    reversibility: 'forward' | 'reverse' | 'bidirectional';
    collapseToThin?: boolean;
  };
};

