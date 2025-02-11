import OlMap from './olmap.js';

export default class Sidebar {
    constructor() {
        // Create sidebar instances
        this.sidebar = $('#sidebar.ui.sidebar')
            .sidebar({
                context: $('.bottom.segment')
            })
            .sidebar('attach events', '.menu .item.openCloseSidebar')
            .sidebar('setting', 'dimPage', false)
            .sidebar('setting', 'closable', false);

        this.sidebarAddLayer = $('#sidebarAddLayer.ui.sidebar')
            .sidebar({
                context: $('.bottom.segment')
            })
            .sidebar('setting', 'dimPage', false)
            .sidebar('setting', 'closable', true);

        // Activate fields
        $('#countryDropdown.dropdown').dropdown();
        $('.ui.checkbox').checkbox();
        this.initSortableList();

        // Activate sidebar listeners
        $('#templateNameIcon').on('click', this.changeTemplateLock)
        $('#changeCameraAngle').on('click', this.changeCameraAngle.bind(this))
        $('#toggleLayerPanel').on('click', this.toggleLayerPanel.bind(this))
        $('.closeLayerPanel').on('click', this.toggleLayerPanel.bind(this));
        $('#addCountries').on('click', this.searchCountry.bind(this));
        $('#dataLayers').on('click', '.removeItem', this.removeSortableItem.bind(this));
    }
  
    // Change the lock icon and enable/disable the input field
    changeTemplateLock() {
        $('#templateNameIcon > .icon').toggleClass('lock').toggleClass('unlock');
        $('#templateNameInput').toggleClass('disabled');
    }
  
    // Change the camera angle of the map
    changeCameraAngle(){
        OlMap.setRotation(Math.random() * 2);
    }
  
    // Initialize the sortable list
    initSortableList() {
      $('.draggable-item').draggable({
        connectToSortable: '#dataLayers',
        stack: '.draggable-item',
        revert: true,
        revertDuration: 200,
        start: (event, ui) => {
            $('#dataLayers').sortable('disable');
        }
      });
  
      $('#dataLayers').sortable({
        connectWith: '#dataLayers',
        items: '.draggable-item, .sortable-item',
        placeholder: "sortable-placeholder",
        start: (event, ui) => {
            $('#sortable1').sortable('enable');
        },
        receive: (event, ui) => {
            if (ui.item.hasClass('ui-draggable')) {
                ui.item.draggable('destroy'); 
            }
        }
      });
    }
  
    // Toggle the extra layer panel
    toggleLayerPanel(e) {
        if (e.target.classList.contains('closeLayerPanel')) {
            this.sidebarAddLayer.sidebar('hide');
        }else{
            this.sidebarAddLayer.sidebar('toggle');
        } 
    }

    // Search for a country from dropdown
    searchCountry(){
        const value = $('#countryDropdown').dropdown('get value');
        if (!value) return;
        OlMap.getSearchResults(value);
        Sidebar.addItemToList(value);
        $('#countryDropdown').dropdown('clear');
    }

    // Add item to the sortable list
    static addItemToList(item){
        const divItem = `
            <div class="row sortable-item">
                <div class="three wide column">
                    <i class="grip horizontal icon"></i>
                </div>
                <div class="ten wide column">` + item + `</div>
                <div class="three wide column">
                    <i class="trash icon removeItem" data-value="` + item +`"></i>
                </div>
            </div>
        `;        
        $("#dataLayers").append(divItem);
        $("#dataLayers").sortable('refresh');
    }

    // Remove item from the sortable list
    removeSortableItem(e){
        let value = null;
        if ('value' in e.target.dataset) {
            value = e.target.dataset.value
        } else {
            return false;
        }
        if (OlMap.removeLayer(value)){
            $(e.target).closest('.sortable-item').remove();
            $("#dataLayers").sortable('refresh');
        }
    }
  }