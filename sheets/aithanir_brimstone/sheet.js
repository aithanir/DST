// Global Options
csx_opts = {
    'setupCallback': function(item){aithanir_brimstone_setup(item);},
    'uiContainer': function(){return document;},
    'defaultFieldValue':'Click to edit',
    'imagePath':'https://chainsawxiv.github.io/DST/common/images/',
    'preloadFiles':[
        'add.png',
        'add_hover.png',
        'balance.png',
        'balance_hover.png',
        'bold_active.png',
        'bold_hover.png',
        'bullet.png',
        'crunch.png',
        'crunch_hover.png',
        'equipment.png',
        'equipment_hover.png',
        'fb_back_bottom.png',
        'fb_back_main.png',
        'fb_back_top.png',
        'fluff.png',
        'fluff_hover.png',
        'grab.png',
        'grab_hover.png',
        'indent.png',
        'indent_active.png',
        'indent_hover.png',
        'italic.png',
        'italic_active.png',
        'italic_hover.png',
        'magic.png',
        'magic_hover.png',
        'tip.png',
        'tip_hover.png',
        'trash.png',
        'trash_active.png',
        'trash_hover.png',
        'underline.png',
        'underline_active.png',
        'underline_hover.png'
    ],
};

aithanir_health = {
    'threshold':{'warning':0, 'danger':-6 },
    'limit': -12
}

aithanir_stability = {
    'threshold': {'warning':0, 'danger':-6},
    'limit': -12
}

// Master Startup
function aithanir_brimstone_dataPostLoad(data){
    console.log("dataPostLoad");
    csx_opts.defaultContext = document.getElementById(data.containerId);
    csx_opts.uiContainer = csx_opts.defaultContext.querySelector('.uicontainer');
    csx_opts.isEditable = data.isEditable;

    // Include the shared script file
    var includes = document.createElement('script');
    includes.type = 'text/javascript';
    includes.src = 'https://aithanir.github.io/DST/common/scripts/csx_common_brimstone.js';
    includes.onload = function(){

        // Fix container properties
        csx_firstParentWithClass(csx_opts.defaultContext,'dynamic_sheet_container').style.overflow = 'visible';
        //csx_firstParentWithClass(csx_opts.defaultContext,'main-content-container').style.minWidth = '853px';

        // Set up the editing interface
        csx_opts.setupCallback();

    };
    document.body.appendChild(includes);

    // Preload rollover images
    // Deferred to prevent blocking
    window.setTimeout(function(){
        if (document.images){
            for (var i = 0; i < csx_opts.preloadFiles.length; i++){
                var img = new Image();
                img.src = csx_opts.imagePath + csx_opts.preloadFiles[i];
            }
        }
    },500);

}

// Setup After Script Load
function aithanir_brimstone_setup(context){

    // Provide default context
    if (context == undefined)
        context = csx_opts.defaultContext;

    // Do setup for interfaces
    csx_pips(context);
    aithanir_pip_pools(context);
    csx_check(context);
    csx_edit(context);
    csx_tip(context);
    csx_list(context);
    csx_tab(context);

}

// Shutdown Before Save
function aithanir_brimstone_dataPreSave(){
    console.log("Punta")
    // Default the context if not set
    var context = csx_opts.defaultContext;

    // Bake everything down to its field values
    var pips = context.querySelectorAll('.pips');
    for (var i = 0; i < pips.length; i++){
        if (pips[i].parentNode.className.match(/proto/))
            continue;
        pips[i].unrender();
    }

    var pip_pools = context.querySelectorAll('.pips_pool');
    console.log("AlPAH");
    for (var i = 0; i < pip_pools.length; i++){
        console.log("BRAVO");
        if (pip_pools[i].parentNode.className.match(/proto/))
            continue;
        pip_pools[i].unrender();
    }

    var checks = context.querySelectorAll('.check');
    for (var i = 0; i < checks.length; i++)
        checks[i].unrender();

    var edits = context.querySelectorAll('.dsf:not(.readonly),.edit');
    for (var i = 0; i < edits.length; i++)
        edits[i].unrender();

    var lists = context.querySelectorAll('.list');
    for (var i = 0; i < lists.length; i++)
        lists[i].unrender();

}


function aithanir_get_general_rating(name){
    var general = JSON.parse(dynamic_sheet_attrs.general.toLowerCase());
    var ability = general.find(function(n){ return n.name == name.toLowerCase();})
    if(ability) {
        return parseInt(ability.rating);
    }
}

// pip_pools Interface Control

function aithanir_pip_pools(context){
    var pips_per_row = 8;


    console.log('pip_pools');

    // Default the context if not set
    if (!context) context = document;


    // Convert each pips field
    var pipsFields = context.querySelectorAll('.pips_pool');
    for (var i = 0; i < pipsFields.length; i++){
        var field = pipsFields[i];


        // Skip list item prototype fields
        if (field.parentNode.className.match(/proto/))
            continue;

        // Set the pixel threshold for each pip
        field.pipThresholds = [0,14,28,42,59,73,87,101,118,132,146,160,177,191,205,219,236];
        field.pipSpacing = 17;
        field.pipWidth = 15.0;
        field.pipLineHeight = 17.0;
        field.pipRadius = 6.0;
        field.pipStrokeColor = '#19110E'; //'#19110E';
        field.pipStrokeThickness = 0.6;

        field.dsField = function(){
            var match = this.className.match(/dsf_[\w]+/);
            if(match){
                return match[0].substring(4);
            }
            return;
        }

        // Gets the total number of possible pips for the field
        field.range = function(){

            console.log(this.rangeCache);
            // Return cached value if it exists
            if(this.rangeCache != null)
                return this.rangeCache;

            var ability = this.dsField();
            if(ability){
                var rating = aithanir_get_general_rating( ability );
                if(!isNaN(rating)){
                    var range = rating+4;
                    this.rangeCache = range;
                    return range;
                }
            }


            // Get the range from the class, cache, and return
            var range =  this.className.match(/pipsRange_[\d]+/g)[0].substring(10);
            this.rangeCache = range;
            return range;

        };

        // Gets the current field value from text or image
        field.value = function(){

            // Return the cached value if it exists
            if(this.valueCache != null)
                return this.valueCache.toString();

            // Get the value from the text content, cache, and return
            var value = this.innerHTML;

            // Catch and fix rare cases of HTML being saved instead of a number
            if(isNaN(value)){
                var pips = this.querySelectorAll( '.pipOn' );
                if(pips)
                    value = pips.length;
                else
                    value = 0;
            }

            if (this.innerHTML == '') value = 0;
            this.valueCache = value;
            return value.toString();

        };


        field.poolFloor = function() { return aithanir_health.limit; };
        field.isWarning  = function(n) { return (aithanir_health.threshold.warning >= n && n > aithanir_health.threshold.danger); };
        field.isDanger   = function(n) { return (aithanir_health.threshold.danger >= n && n > aithanir_health.limit); };
        field.isDepleted = function(n) { return (aithanir_health.limit >= n); };


        field.foo = function(n) {
            if(isNaN(n))
                return;
            if(n==0)
                return;
            if(n>0){
                return Math.abs((n-1) % pips_per_row)
            }else{
                return (pips_per_row-1) - Math.abs((n+1) % pips_per_row);
            }
        }

        field.bar = function(n) {
            if(isNaN(n))
                return false;
            if(n==0)
                return false;
            if(n>0) {
                return n % pips_per_row == 0
            } else {
                return Math.abs(n+1) % pips_per_row == 0
            }
        };

        // Converts the content to their visual representation
        field.render = function(){

            // Skip hidden fields
            var allowEdit = true;
            var curr_row = 0;

            if (this.value()){
                if (this.value().match(/[\s]*hidden/)){
                    allowEdit = false;
                    if (csx_opts.isEditable)
                        this.style.opacity = '0.1';
                    else{
                        this.innerHTML = '';
                        return;
                    }
                }
            }

            // Skip fields with a value of -1
            var intVal = parseInt(this.value());

            // Replace the contents with the appropriate pips
            var border = document.createElement('div');
            border.className = 'pipBorder';

            this.innerHTML = '';
            for (var i = this.range(); i >= field.poolFloor(); i--){
                if(this.bar(i)) curr_row++;
                if(curr_row==0) curr_row++;

                if(i != 0){
                    var pip = document.createElement('div');
                        pip.value = i;
                        pip.className = 'pip'
                        pip.className += (pip.value <= intVal) ? ' pipOn' : ' pipOff';
                        pip.className += (this.isWarning(intVal)) ? ' warning' : (this.isDanger(intVal)) ? ' danger' : '';
                        pip.className += ( 0 > pip.value && pip.value >= -pips_per_row) ? ' subzero' : '';
                        pip.style.right = this.pipThresholds[this.foo(i)] + 'px';
                        pip.style.top = ((curr_row-1) * field.pipLineHeight) + 'px';
                        pip.appendChild(border.cloneNode(false));

                    if (allowEdit && csx_opts.isEditable){
                        pip.addEventListener('click', function(){this.parentNode.click(this.value);}, false);
                    }

                    this.appendChild(pip);
                }

            }

            // Display any status messages
            if( this.isWarning(this.value()) ){
                this.parentNode.querySelectorAll(".pool_status.warning").forEach(function(t){ t.style.visibility = "visible"; });
            }else{
                this.parentNode.querySelectorAll(".pool_status.warning").forEach(function(t){ t.style.visibility = "hidden"; })
            }

            if( this.isDanger(this.value()) ){
                this.parentNode.querySelectorAll(".pool_status.danger").forEach(function(t){ t.style.visibility = "visible"; });
            }else{
                this.parentNode.querySelectorAll(".pool_status.danger").forEach(function(t){ t.style.visibility = "hidden"; })
            }

            if( this.isDepleted(this.value()) ){
                this.parentNode.querySelectorAll(".pool_status.depleted").forEach(function(t){ t.style.visibility = "visible"; });
            }else{
                this.parentNode.querySelectorAll(".pool_status.depleted").forEach(function(t){ t.style.visibility = "hidden"; })
            }

            // Activate the pips
            if (allowEdit && csx_opts.isEditable){
                this.title = 'Click to set value';
                this.style.cursor = 'pointer';
                this.style.height = (this.pipLineHeight*(curr_row+1)) + 'px';
            }

        };

        // Converts the value back from image to text
        field.unrender = function(){

            // Replace the contents with the appropriate value string
            this.innerHTML = this.value();

        };

        // Click event handler for the pips interface
        field.click = function(clickedValue){

            // If the user clicks the current score, they probably want to reduce by one
            if (clickedValue == this.value())
                this.valueCache = clickedValue - 1;
            else
                this.valueCache = clickedValue;

            // Rerender the pips
            this.render();

            // Invoke the update event handler
            this.update();

            // Then we're done
            return;

        };

        // Right mouse down handler for menu control
        field.rmousedown = function(e){
            pipsMenu.currentField = this;
            if (this.value().match(/[\s]*hidden/))
                pipsMenu.querySelector('menuitem').label = 'Show Pips';
            else
                pipsMenu.querySelector('menuitem').label = 'Hide Pips';
        }

        // Padds a value with leading zeros to length
        field.pad = function(value,digits){

            value = value.toString();
            while (value.length < digits)
                value = '0' + value;

            return value;

        }

        // On Update event function, typicaly overriden
        field.update = function(){
            var ability = this.dsField();
            if(ability){
                $('.pool_display.readonly.dsf_' + ability).text(this.valueCache);
            }
        }

        // Convert the field value to pips display
        field.render();

    }
}
