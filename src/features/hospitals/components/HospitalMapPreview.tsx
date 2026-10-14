"use client";

import { OsmHospitalMap, type OsmHospitalMapProps } from "./OsmHospitalMap";

export type HospitalMapPreviewProps = OsmHospitalMapProps;

export function HospitalMapPreview(props: HospitalMapPreviewProps) {
  return <OsmHospitalMap {...props} />;
}

export { OsmHospitalMap };
