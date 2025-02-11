import OlMap from './olmap.js';
import Sidebar from './sidebar.js';


export default class Menu {
    constructor() {
        // Activate search listeneres
        $('#searchPlaces .link').on('click', this.getSearchResults.bind(this));
        $('#searchPlaces input').on('keypress', (e) => (e.which === 13) ? this.getSearchResults() : Menu.changeSearchState('!error'));
    }
  
    // Get search results from OpenStreetMap
    getSearchResults() {
      const value = $('#searchPlaces input').val()
      if (!value) return;
      OlMap.getSearchResults(value);
      Sidebar.addItemToList(value);
    }
  
    // Get the current state of the search input (loading, error)
    static getSearchState(checkValue = null) {
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
    static changeSearchState(action, context) {
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