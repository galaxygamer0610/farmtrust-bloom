import urllib.request
import urllib.error
import urllib.parse
import json
import asyncio

IMD_FALLBACK = {
    "North": {"avg_temperature": 22.4, "rainfall": 210.0},
    "South": {"avg_temperature": 28.7, "rainfall": 1850.0},
    "East":  {"avg_temperature": 27.1, "rainfall": 1420.0},
    "West":  {"avg_temperature": 25.8, "rainfall": 680.0},
}
NDMA_FALLBACK = {
    "North": {"drought_index": 0.38, "flood_risk": 0.22},
    "South": {"drought_index": 0.45, "flood_risk": 0.55},
    "East":  {"drought_index": 0.30, "flood_risk": 0.70},
    "West":  {"drought_index": 0.72, "flood_risk": 0.18},
}
AGMARKNET_FALLBACK = {
    "Wheat": 124.0, "Rice": 118.5, "Cotton": 132.0, "Maize": 108.0,
    "Pulses": 141.0, "Vegetables": 95.0, "Groundnut": 127.0,
}
INPUT_COST_FALLBACK = {
    "North": 98.0, "South": 104.0, "East": 92.0, "West": 101.0,
}
POLICY_FALLBACK = {
    "North": 3, "South": 2, "East": 2, "West": 4,
}

SCHEMES_FALLBACK = [
    {"scheme_id": "SS001", "scheme_name": "PM Fasal Bima Yojana (PMFBY)", "benefits": "Up to Rs 2 lakh crop loss compensation.", "min_land": 0.5, "max_land": 999.0, "max_rev": 9999.0, "req_sizes": ["Small","Medium","Large"], "req_crops": [], "req_regions": [], "req_irrigation": []},
    {"scheme_id": "SS002", "scheme_name": "Kisan Credit Card (KCC)", "benefits": "Loan up to Rs 3 lakh at 4% interest.", "min_land": 0.0, "max_land": 10.0, "max_rev": 300.0, "req_sizes": ["Small","Medium"], "req_crops": [], "req_regions": [], "req_irrigation": []},
    {"scheme_id": "SS003", "scheme_name": "PM Kisan Samman Nidhi (PM-KISAN)", "benefits": "Rs 6,000/year in 3 instalments.", "min_land": 0.0, "max_land": 2.0, "max_rev": 200.0, "req_sizes": ["Small"], "req_crops": [], "req_regions": [], "req_irrigation": []},
    {"scheme_id": "SS004", "scheme_name": "Per Drop More Crop (PDMC)", "benefits": "55% subsidy on irrigation installation.", "min_land": 1.0, "max_land": 20.0, "max_rev": 9999.0, "req_sizes": ["Small","Medium","Large"], "req_crops": ["Cotton", "Vegetables", "Pulses"], "req_regions": [], "req_irrigation": ["Drip", "Sprinkler", "Rainfed"]},
    {"scheme_id": "SS005", "scheme_name": "National Mission Sustainable Agri (NMSA)", "benefits": "Grants for climate adaptation and soil health.", "min_land": 1.0, "max_land": 999.0, "max_rev": 9999.0, "req_sizes": ["Small","Medium","Large"], "req_crops": [], "req_regions": ["East","West","South"], "req_irrigation": []},
    {"scheme_id": "SS006", "scheme_name": "Agricultural Infrastructure Fund (AIF)", "benefits": "Loans up to Rs 2 crore at 3% interest subvention.", "min_land": 2.0, "max_land": 999.0, "max_rev": 9999.0, "req_sizes": ["Medium","Large"], "req_crops": [], "req_regions": [], "req_irrigation": []},
    {"scheme_id": "SS007", "scheme_name": "Soil Health Card Scheme", "benefits": "Free soil testing, reduces input costs 10-15%.", "min_land": 0.5, "max_land": 999.0, "max_rev": 9999.0, "req_sizes": ["Small","Medium","Large"], "req_crops": [], "req_regions": [], "req_irrigation": []},
    {"scheme_id": "SS008", "scheme_name": "National Food Security Mission (NFSM)", "benefits": "Subsidised seeds, fertilisers, equipment.", "min_land": 0.0, "max_land": 5.0, "max_rev": 9999.0, "req_sizes": ["Small","Medium"], "req_crops": ["Wheat", "Rice", "Maize", "Pulses"], "req_regions": ["North","East"], "req_irrigation": []}
]

# Mapping Indian Regions to general Geocoordinates for Open-Meteo fallback
REGION_COORDINATES = {
    "North": {"lat": 28.6139, "lon": 77.2090}, # Delhi
    "South": {"lat": 12.9716, "lon": 77.5946}, # Bangalore
    "East":  {"lat": 22.5726, "lon": 88.3639}, # Kolkata
    "West":  {"lat": 19.0760, "lon": 72.8777}  # Mumbai
}

def map_state_to_region(state: str) -> str:
    s = state.lower()
    if s in ["delhi", "punjab", "haryana", "uttar pradesh", "uttarakhand", "himachal pradesh", "jammu", "kashmir"]:
        return "North"
    elif s in ["karnataka", "tamil nadu", "kerala", "andhra pradesh", "telangana"]:
        return "South"
    elif s in ["west bengal", "odisha", "bihar", "jharkhand", "assam"]:
        return "East"
    return "West"

async def geocode_location(city: str) -> dict:
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
    result = await asyncio.to_thread(fetch_api_sync, url, {"results": []})
    if result["success"] and result["data"].get("results"):
        return {
            "lat": result["data"]["results"][0]["latitude"],
            "lon": result["data"]["results"][0]["longitude"]
        }
    return None

def fetch_api_sync(url, fallback_val):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 FarmerCreditSystem/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=4.0) as response:
            data = response.read()
            return {"success": True, "data": json.loads(data)}
    except Exception as e:
        print(f"[API ERROR] {url} failed: {e}. Using fallback...")
        return {"success": False, "data": fallback_val}

async def fetch_external_data(state: str, city: str, crop_type: str) -> dict:
    
    region = map_state_to_region(state)
    geo = await geocode_location(city)
    
    if geo:
        lat, lon = geo["lat"], geo["lon"]
    else:
        coords = REGION_COORDINATES.get(region, REGION_COORDINATES["East"])
        lat, lon = coords["lat"], coords["lon"]

    # Encode components for URLs
    enc_state = urllib.parse.quote(state)
    enc_city = urllib.parse.quote(city)

    # Open-Meteo is a LIVE public internet API for weather metrics without Auth Keys
    urls = {
        "weather": f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&daily=precipitation_sum&timezone=Asia/Kolkata",
        "ndma": f"https://api.ndma.gov.in/v1/risk?state={enc_state}&district={enc_city}",
        "agmarknet": f"https://api.agmarknet.gov.in/v1/price?state={enc_state}&district={enc_city}&crop={crop_type}",
        "inputcost": f"https://api.agricoop.gov.in/v1/inputcost?state={enc_state}&district={enc_city}",
        "policy": f"https://api.agricoop.gov.in/v1/policy?state={enc_state}&district={enc_city}"
    }

    fallbacks = {
        "weather": IMD_FALLBACK.get(region, IMD_FALLBACK["East"]),
        "ndma": NDMA_FALLBACK.get(region, NDMA_FALLBACK["East"]),
        "agmarknet": {"commodity_price_index": AGMARKNET_FALLBACK.get(crop_type, 100.0)},
        "inputcost": {"input_cost_index": INPUT_COST_FALLBACK.get(region, 100.0)},
        "policy": {"policy_support_score": POLICY_FALLBACK.get(region, 2)}
    }

    results = await asyncio.gather(
        asyncio.to_thread(fetch_api_sync, urls["weather"], fallbacks["weather"]),
        asyncio.to_thread(fetch_api_sync, urls["ndma"], fallbacks["ndma"]),
        asyncio.to_thread(fetch_api_sync, urls["agmarknet"], fallbacks["agmarknet"]),
        asyncio.to_thread(fetch_api_sync, urls["inputcost"], fallbacks["inputcost"]),
        asyncio.to_thread(fetch_api_sync, urls["policy"], fallbacks["policy"])
    )
    
    # Process Weather API Output (Open-Meteo specific JSON processing)
    weather_res_dict = results[0]
    if weather_res_dict["success"]:
        real_data = weather_res_dict["data"]
        # Open-Meteo JSON format extraction
        avg_temp = real_data.get("current_weather", {}).get("temperature", fallbacks["weather"]["avg_temperature"])
        # Multiply daily precipitation by 150 to approximate local annualized values for the model
        precip = real_data.get("daily", {}).get("precipitation_sum", [0.0])[0]
        rain_scale = max(precip * 150.0, fallbacks["weather"]["rainfall"])
    else:
        avg_temp = weather_res_dict["data"]["avg_temperature"]
        rain_scale = weather_res_dict["data"]["rainfall"]

    return {
        "avg_temperature": avg_temp,
        "rainfall": rain_scale,
        "drought_index": results[1]["data"].get("drought_index", fallbacks["ndma"]["drought_index"]),
        "flood_risk": results[1]["data"].get("flood_risk", fallbacks["ndma"]["flood_risk"]),
        "commodity_price_index": results[2]["data"].get("commodity_price_index", fallbacks["agmarknet"]["commodity_price_index"]),
        "input_cost_index": results[3]["data"].get("input_cost_index", fallbacks["inputcost"]["input_cost_index"]),
        "policy_support_score": results[4]["data"].get("policy_support_score", fallbacks["policy"]["policy_support_score"])
    }

async def fetch_available_schemes():
    """Fetches dynamic government registry of subsidies."""
    url = "https://api.india.gov.in/v1/schemes/agriculture"
    result = await asyncio.to_thread(fetch_api_sync, url, SCHEMES_FALLBACK)
    return result["data"]
