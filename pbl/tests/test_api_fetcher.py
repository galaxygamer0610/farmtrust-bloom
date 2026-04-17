import unittest
import asyncio
from unittest.mock import patch, MagicMock
import urllib.error
import json
import sys
import os

# Add the parent directory to sys.path so we can import api_fetcher
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api_fetcher import fetch_api_sync, fetch_external_data, fetch_available_schemes, IMD_FALLBACK, SCHEMES_FALLBACK

class TestAPIFetcher(unittest.TestCase):
    
    @patch('urllib.request.urlopen')
    def test_fetch_api_sync_success(self, mock_urlopen):
        """Test that the synchronous fetch successfully parses a 200 OK JSON response."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"avg_temperature": 30.5, "rainfall": 100.0}).encode('utf-8')
        
        # We need the context manager (__enter__) to return our mock response
        mock_urlopen.return_value.__enter__.return_value = mock_response
        
        result = fetch_api_sync("https://dummy.api.com", {"fallback": True})
        
        # Verify it returns the json formatted success wrapper
        self.assertTrue(result["success"])
        self.assertEqual(result["data"], {"avg_temperature": 30.5, "rainfall": 100.0})
        mock_urlopen.assert_called_once()

    @patch('urllib.request.urlopen')
    def test_fetch_api_sync_fallback_on_error(self, mock_urlopen):
        """Test that HTTP errors route cleanly to the mathematical fallback objects."""
        # Force a 404 HTTP Error
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="http://dummy.com", code=404, msg="Not Found", hdrs=None, fp=None
        )
        
        fallback_data = {"avg_temperature": 25.0} # Imaginary fallback
        result = fetch_api_sync("https://dummy.api.com", fallback_data)
        
        # Assert it cleanly returns the failure wrapper with the fallback data
        self.assertFalse(result["success"])
        self.assertEqual(result["data"], fallback_data)

    @patch('api_fetcher.geocode_location')
    @patch('api_fetcher.fetch_api_sync')
    def test_full_external_data_async_fallback_routing(self, mock_fetch, mock_geo):
        """
        Test the async orchestration. We mock the geocoder and fetcher to ensure 
        predictable behavior without hitting live internet APIs.
        """
        # Force geocoder to fail to test fallback routing
        mock_geo.return_value = None
        # Force all fetch calls to fail
        mock_fetch.return_value = {"success": False, "data": IMD_FALLBACK["East"]}
        
        # Run the async function
        result = asyncio.run(fetch_external_data(state="West Bengal", city="Kolkata", crop_type="Wheat"))
        
        # Ensure it properly built a dictionary from the fallbacks
        self.assertIn("avg_temperature", result)
        self.assertEqual(result["avg_temperature"], 27.1) # East Fallback 
        self.assertEqual(result["rainfall"], 1420.0) # East Fallback

    def test_fetch_available_schemes_api_fallback(self):
        """
        Tests the newly integrated government schemes registry API. 
        Because it is a simulated endpoint, it should purposefully fail and route to the SCHEMES_FALLBACK block.
        """
        result = asyncio.run(fetch_available_schemes())
        
        # Ensure it returns an array of schemes
        self.assertIsInstance(result, list)
        
        # Ensure it successfully returned the schema dictionary objects
        if len(result) > 0:
            self.assertIn("scheme_id", result[0])
            self.assertEqual(result[0]["scheme_id"], "SS001")

if __name__ == '__main__':
    unittest.main()
