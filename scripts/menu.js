import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import OlMap from './olmap.js';


export default class Menu {
    constructor() {
        // Activate search listeneres
        $('#searchPlaces .link').on('click', this.getSearchResults.bind(this));
        $('#searchPlaces input').on('keypress', (e) => (e.which === 13) ? this.getSearchResults() : this.changeSearchState('!error'));
    }
  
    // Get search results from OpenStreetMap
    getSearchResults() {
    
        if (this.getSearchState('loading')) return;
        this.changeSearchState('clear');
  
        const searchText = $('#searchPlaces input').val();
        if (!searchText) return;
  
        this.changeSearchState('loading');
      
        $.ajax({
            method: "GET",
            url: "https://nominatim.openstreetmap.org",
            data: {
                "format": "geojson",
                "polygon_geojson": 1,
                "dedupe": 0,
                "bounded": 1,
                "polygon_threshold": "0000",
                "q": searchText,
                "limit": 1
            }
        }).done((response) => {
            // Check if there are any results
            if (response.features.length > 0) {
                // Create a vector layer and fill it with the features from the search results
                const vectorSource = new VectorSource();
                const featureObj = new GeoJSON({featureProjection: 'EPSG:3857'}).readFeatures({
                    'type': 'FeatureCollection',
                    'crs': {
                        'type': 'name',
                        'properties': {
                            'name': 'EPSG:3857',
                        },
                    },
                    'features': response.features
                });
                vectorSource.addFeatures(featureObj);
                const vectorLayer = new VectorLayer({
                    source: vectorSource,
                    style: new Style({
                        stroke: new Stroke({
                            color: 'rgba(255, 0, 0)',
                            width: 2,
                        }),
                        fill: new Fill({
                            color: 'transparent',
                        }),
                    }),
                });
                
                // Add the vector layer to the map and zoom to the extent of the search results
                OlMap.map.addLayer(vectorLayer);
                OlMap.map.getView().fit(vectorSource.getExtent(), {
                    size: OlMap.map.getSize(),
                    padding: [50, 50, 50, (50 + $('#sidebar.uncover').width() || 0)],
                    duration: 500
                }); 
    
            } else {
                // Show popup with error message
                this.changeSearchState('error', 'Geen resultaten gevonden');
            }
        }).fail((jqXHR, textStatus) => {
            // Show popup with error message
            this.changeSearchState('error', 'Geen resultaten gevonden');
        }).always(() => {
            // Always remove loading state
            this.changeSearchState('!loading');
        });
    }
  
    // Get the current state of the search input (loading, error)
    getSearchState(checkValue = null) {
      if (checkValue !== null) {
        return (checkValue.indexOf('!') === 0) ? !$('#searchPlaces').hasClass(checkValue) : $('#searchPlaces').hasClass(checkValue);
      }
      const options = ['loading', 'error'];
      let results = [];
      for (const option of options) {
        if ($('#searchPlaces').hasClass(option)) {
          results.push(option);
        } else {
          results.push('!'+option);
        }
      }
      return results;
    }
    
    // Change the state of the search input (loading, error)
    changeSearchState(action, context) {
      switch (action) {
        case 'loading':
          $('#searchPlaces').addClass('loading');
          break;
        case '!loading':
          $('#searchPlaces').removeClass('loading');
          break;
        case 'error':
          $('#searchPlaces').addClass('error');
          $('#searchPlaces input').popup({
            position: 'bottom center',
            content: context,
            on: 'manual'
          }).popup('show');
          break;
        case '!error':
          $('#searchPlaces').removeClass('error');
          $('#searchPlaces input').popup('destroy');
          break;
        default:
          $('#searchPlaces').removeClass('loading');
          $('#searchPlaces').removeClass('error');
          break;
      }
    }
  }