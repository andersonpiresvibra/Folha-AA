export interface AppState {
  operatorName: string;
  americanNumber: string;
  flightNumber: string;
  distributionLeft: number | '';
  distributionCenter: number | '';
  distributionRight: number | '';
  aircraftPrefix: string;
  aircraftModel: string;
  remLeft: number | '';
  remCenter: number | '';
  remRight: number | '';
  currentLeft: number | '';
  currentCenter: number | '';
  currentRight: number | '';
  density: number | '';
  gallonsAddedMeter: number | '';
  meters: (number | '')[];
  operatorInitials: string;
  equipNumber: string;
}

export const initialState: AppState = {
  operatorName: '',
  americanNumber: '',
  flightNumber: '',
  distributionLeft: '',
  distributionCenter: '',
  distributionRight: '',
  aircraftPrefix: '',
  aircraftModel: '',
  remLeft: '',
  remCenter: '',
  remRight: '',
  currentLeft: '',
  currentCenter: '',
  currentRight: '',
  density: '',
  gallonsAddedMeter: '',
  meters: [''],
  operatorInitials: '',
  equipNumber: '',
};
