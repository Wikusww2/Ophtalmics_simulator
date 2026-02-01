import { transposeMinusToPlus } from '../optics/cylAxis'
import { axisToleranceDeg, cylinderToleranceD } from '../optics/tolerances'
import { sphericalEquivalent, vogelBaseCurve } from '../optics/baseCurve'

export function buildSpecSheetJSON(design: any) {
  const rx = { sphere: design.spherePower, cylinder: design.cylinderPower, axisDeg: design.axisDeg }
  const transposed = transposeMinusToPlus(rx)
  const axisTol = axisToleranceDeg(Math.abs(rx.cylinder))
  const cylTol = cylinderToleranceD(Math.abs(rx.cylinder))
  const payload = {
    material: design.material,
    geometry: {
      front: design.front,
      back: design.back,
      placement: design.toricPlacement,
      CT: design.centerThickness,
      diameter: design.diameter,
      clearAperture: design.clearAperture,
    },
    curvatureSource: {
      default: 'Flat front/back → Sphere control',
      spherePlacement: design.spherePlacement,
      bestForm: design.useBestForm,
      se: sphericalEquivalent(design.spherePower, design.cylinderPower),
      vogelBase: vogelBaseCurve(sphericalEquivalent(design.spherePower, design.cylinderPower)),
    },
    rx: {
      enteredMinusForm: rx,
      transposedPlusForm: transposed,
    },
    tolerances: {
      axisToleranceDeg: axisTol,
      cylinderToleranceD: cylTol,
    }
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}
