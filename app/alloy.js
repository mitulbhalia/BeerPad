// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// args. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Alloy.Globals.beerListSecondaryValue = 'brewery';

Alloy.Globals.mapLabelText = function($, args) { 

    $.name.text = args.name.toUpperCase();
    
    var breweryAndPercentText = args.percent ? args.brewery + " | " + args.percent : args.brewery;
    
    if (!args.percent  &&  args.brewery) breweryAndPercentText = args.brewery;
    if ( args.percent  &&  args.brewery) breweryAndPercentText = args.brewery + " | " + args.percent + "%";
    if ( args.percent  && !args.brewery) breweryAndPercentText = args.percent + "%";
    
    $.brewery.text = breweryAndPercentText;
    $.pub.text = args.establishment || L("detail_no_pub");
    $.location.text = args.location || L("detail_no_location");
    $.notes.text = args.notes;
    
    var theImage = Alloy.Globals.getImage(args);
    
    if (theImage) {
        $.image.image = theImage;   
    }

    if (!args.establishment) {
        $.buildingIcon.setImage('buildingGrey.png');
        $.pub.setColor('#b9b9b9');
    };
    if (!args.location) {
        $.locationIcon.setImage('locationGrey.png');
        $.location.setColor('#b9b9b9');
    }
};

Alloy.Globals.getImage = function(args) {
    var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, args.alloy_id + '.jpg');  
    var fileSystemImage = f.read();  
    if (fileSystemImage) {
        return fileSystemImage;
    }
    if (args.beer_image) {
        if (args.beer_image.indexOf("sample_") === 0) {
            return args.beer_image;
        }
    }
};

Alloy.Globals.saveImage = function(alloy_id, theImage) {
    var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, alloy_id + '.jpg');
    f.write(theImage);  
};

Alloy.Globals.openBeerDetails = function (event, collection, target) {
    var selectedBeer = event.row;
      
    var args = {};
    
    _.each(selectedBeer, function(value, key) {
       args[key] = value; // store all info to pass to the view
    });
    
    args.model = collection.get(event.row.alloy_id);
    
    var view = Alloy.createController("BeerDetail", args).getView();
    
    Alloy.Globals.mainTabGroup.getActiveTab().open(view, { animated: true });      
};

Alloy.Globals.beerListTransform = function(modal) {
        
    var result = modal.toJSON();  
   
    if (!result.beer_image) { 
        result.list_image = "dafaultListImage.png";
    } else {
        if (result.beer_image.indexOf('sample_') === 0) {
            result.list_image = result.beer_image;
        } else {
            result.list_image = Alloy.Globals.getImage(result.alloy_id);   
        }
    }   
    
    var secValue = Alloy.Globals.beerListSecondaryValue;

    if (secValue === "rating") {
        result.secondaryInfo = result.rating === null ? "No rating" : result.rating + " stars";    
    } else if (secValue === "percent") {
        result.secondaryInfo = "" + result.percent + "%";
    } else if (secValue === "date") {
        result.secondaryInfo = "" + result.date_string;
    } else {
        result.secondaryInfo = result[secValue];    
    }    
    return result;
};

Alloy.Globals.returnSortingDialog = function (theBeers) {
    var opts = [
        L("sort_newest"), L("sort_oldest"), L("sort_rated_high"), L("sort_rated_low"), 
        L("sort_percent_desc"), L("sort_percent_asc"), L("sort_name_asc"), L("sort_name_desc"), L("sort_cancel") 
    ];
    
    var filterDialog = Ti.UI.createOptionDialog({
        title: L("sort_title"),
        options: opts
    });
    
    filterDialog.cancel = 8;
    
    filterDialog.addEventListener("click", function (e) {
        if (e.index === 0) {
            Alloy.Globals.beerListSecondaryValue = "date";
            theBeers.setSortField("date", "DESC");
            theBeers.sort();  
        }
        if (e.index === 1) {
            Alloy.Globals.beerListSecondaryValue = "date";
            theBeers.setSortField("date", "ASC");
            theBeers.sort();
        }
        if (e.index === 2) {
            Alloy.Globals.beerListSecondaryValue = "rating";
            theBeers.setSortField("rating", "DESC");
            theBeers.sort();
        }
        if (e.index === 3) {
            Alloy.Globals.beerListSecondaryValue = "rating";
            theBeers.setSortField("rating", "ASC");
            theBeers.sort();
        }
        if (e.index === 4) {
            Alloy.Globals.beerListSecondaryValue = "percent";
            theBeers.setSortField("percent", "DESC");
            theBeers.sort();
        }
        if (e.index === 5) {
            Alloy.Globals.beerListSecondaryValue = "percent";
            theBeers.setSortField("percent", "ASC");
            theBeers.sort();
        }
        if (e.index === 6) {
            Alloy.Globals.beerListSecondaryValue = "brewery";
            theBeers.setSortField("name", "ASC");
            theBeers.sort();
        }
        if (e.index === 7) {
            Alloy.Globals.beerListSecondaryValue = "brewery";
            theBeers.setSortField("name", "DESC");
            theBeers.sort();
        }
    });    
    
    return filterDialog;
};

Alloy.Globals.addToFavourites = function (alloy_id) {
    var beerCollection = Alloy.Collections.beers;
    beerCollection.fetch();
    var theBeer = beerCollection.where({"alloy_id": alloy_id})[0];
    theBeer.set({favourite: 1});
    theBeer.save();  
};


