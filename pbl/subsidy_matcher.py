def match_subsidies(farmer_data: dict, available_schemes: list) -> list:
    """
    Dynamically filters a list of government subsidy schemes based on the farmer's inputs.
    Instead of hardcoded rules, it iterates over JSON schema constraints natively.
    """
    ent_size = farmer_data.get('enterprise_size', 'Small')
    region = farmer_data.get('region', 'North')
    rev = farmer_data.get('annual_revenue', 0.0)
    land = farmer_data.get('landholding_size', 0.0)
    crop = farmer_data.get('crop_type', '')
    irr = farmer_data.get('irrigation_type', '')

    eligible_schemes = []

    for scheme in available_schemes:
        # 1. Check Land Bounds
        if not (scheme.get('min_land', 0.0) <= land <= scheme.get('max_land', 9999.0)):
            continue
            
        # 2. Check Revenue Limits
        if rev > scheme.get('max_rev', 999999.0):
            continue
            
        # 3. Check Enterprise Size
        req_sizes = scheme.get('req_sizes', [])
        if req_sizes and ent_size not in req_sizes:
            continue
            
        # 4. Check Crop Requirements
        req_crops = scheme.get('req_crops', [])
        if req_crops and crop not in req_crops:
            continue
            
        # 5. Check Regional Requirements
        req_regions = scheme.get('req_regions', [])
        if req_regions and region not in req_regions:
            continue
            
        # 6. Check Irrigation Type
        req_irrigation = scheme.get('req_irrigation', [])
        if req_irrigation and irr not in req_irrigation:
            continue
            
        # If the farmer passes all checks for this specific JSON scheme, append it
        eligible_schemes.append({
            "scheme_id": scheme.get('scheme_id'),
            "scheme_name": scheme.get('scheme_name'),
            "benefits": scheme.get('benefits'),
            "match_score": 1.0  # Perfect criteria match
        })

    # Sort logic or return dynamically
    eligible_schemes.sort(key=lambda x: x['match_score'], reverse=True)
    return eligible_schemes
