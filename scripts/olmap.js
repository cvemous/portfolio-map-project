import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

import Menu from './menu.js';

export default class OlMap {
    static map;

    constructor() {
        // Create OpenLayers map
        OlMap.map = new Map({
            target: 'map',
            layers: [
            new TileLayer({
                source: new OSM()
            })
            ],
            controls: [],
            view: new View({
            center: [664137, 6838516],
            zoom: 5
            })
        });
    }

    // Public method to set the rotation of the map
    static setRotation(angle){
        OlMap.map.getView().setRotation(Math.PI * angle)
    }

    // Get search results from OpenStreetMap
    static getSearchResults(query) {
    
        if (Menu.getSearchState('loading')) return;
        Menu.changeSearchState('clear');
  
        if (!query) return;
  
        Menu.changeSearchState('loading');
      
        $.ajax({
            method: "GET",
            url: "https://nominatim.openstreetmap.org",
            data: {
                "format": "geojson",
                "polygon_geojson": 1,
                "dedupe": 0,
                "bounded": 1,
                "polygon_threshold": "0000",
                "q": query,
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
                    name: query,
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
                Menu.changeSearchState('error', 'Geen resultaten gevonden');
            }
        }).fail((jqXHR, textStatus) => {
            // Show popup with error message
            Menu.changeSearchState('error', 'Geen resultaten gevonden');
        }).always(() => {
            // Always remove loading state
            Menu.changeSearchState('!loading');
        });
    }

    // Public method to remove a layer from the map
    static removeLayer(layerName){
        const layer = OlMap.map.getLayers().getArray().find(layer => layer.get('name') == layerName);
        if (layer) {
            return OlMap.map.removeLayer(layer);
        }
    }
}