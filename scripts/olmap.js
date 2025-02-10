import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

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
            center: [0, 0],
            zoom: 1
            })
        });
    }

    // Public method to set the rotation of the map
    static setRotation(angle){
        OlMap.map.getView().setRotation(Math.PI * angle)
    }
}