export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent?: string };
  groundingChunks?: Array<{
    web?: { uri?: string; title?: string };
    places?: {
      placeId?: string;
      name?: string;
      formattedAddress?: string;
      types?: string[];
      websiteUri?: string;
    };
  }>;
  groundingSupports?: Array<{
    groundingChunkIndices?: number[];
    confidenceScores?: number[];
    segment?: { text?: string };
  }>;
}

export interface MapsGroundingResponse {
  success: boolean;
  text: string;
  groundingMetadata?: GroundingMetadata | null;
  model?: string;
  groundedWith?: string;
  error?: string;
}

export async function requestGoogleMapsGrounding(params: {
  queryType: 'search_nodes' | 'route_intel' | 'verify_address';
  location: string;
  destination?: string;
  foodItem?: string;
  quantity?: string;
}): Promise<MapsGroundingResponse> {
  try {
    const res = await fetch('/api/maps/grounding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Maps Grounding request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    console.error('Maps Grounding API error:', err);
    throw err;
  }
}
