export interface DgegSearchStation {
  Id: number;
  Nome: string;
  Marca: string;
  Municipio: string;
  Latitude: number;
  Longitude: number;
  Combustivel?: string;
  Preco?: string;
  DataAtualizacao?: string;
}

export interface DgegFuel {
  TipoCombustivel: string;
  Preco: string;
  DataAtualizacao?: string;
}

export interface DgegStationDetail {
  Nome: string;
  Marca: string;
  TipoPosto?: string;
  Morada?: {
    Morada?: string;
    Localidade?: string;
    CodPostal?: string;
    Latitude?: number;
    Longitude?: number;
    Municipio?: string;
    Distrito?: string;
  };
  Combustiveis?: DgegFuel[];
}

export interface FuelStationResult {
  id: string;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  price: number;
  fuelType: string;
  distance: number;
  lastUpdated: string;
  municipio?: string;
  morada?: string;
}

export interface BrandPriceResult {
  brand: string;
  price: number;
  count: number;
  savings: number;
}
