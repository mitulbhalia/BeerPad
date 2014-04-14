var ratingStars = require('ratingStars');

var args = arguments[0] || {};
var beersCollection = Alloy.createCollection('beers');
beersCollection.fetch();


// The Image

var date = new Date(args.date);

// The Details

$.BeerDetail.setTitle(args.name);

Alloy.Globals.mapLabelText($, args);



// Navigation Bar Button

if (OS_IOS) {
    var editButton = Ti.UI.createButton({ titleid: "detail_edit_btn" });
    $.BeerDetail.setRightNavButton(editButton);
    
    editButton.addEventListener("click", function (e) {
        args.edit = true;
        var window = Alloy.createController('addBeer', args).getView();
        window.open({
            modal:true,
            modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
            modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
        });   
    });
}



// Update Beer after edit event fired in addBeer.js

Ti.App.addEventListener("app:updateBeer", function(e) {
    beersCollection.fetch();
    
    var updatedData = beersCollection.where({"alloy_id": args.alloy_id})[0].toJSON();
    
    $.BeerDetail.setTitle(updatedData.title);
    
    var updatedStars = ratingStars.drawStars({
        rating: updatedData.rating,
        starHeight: 22,
        starWidth: 22
    });
    
    $.ratingView.remove(theStars);
    $.ratingView.add(updatedStars);

    Alloy.Globals.mapLabelText($, updatedData);
    
    args = updatedStars;
});



// Apply Star Ratings

var theStars = ratingStars.drawStars({
    rating: args.rating,
    starHeight: 22,
    starWidth: 22
});

$.ratingView.add(theStars);


// View Image

function viewImage() {
    var beerImage = Alloy.createController("BeerImage");
    beerImage.image.image = $.image.image;
    beerImageView = beerImage.getView();
    Alloy.Globals.navGroupWin.openWindow(beerImageView);    
}


// Share Dialog

function share() {

   var Social = require('dk.napp.social');
   
   var theImage = Alloy.Globals.getImage(args);
   
   if (theImage) {
       if (theImage.hasOwnProperty('getNativePath')) {
           theImagePath = theImage.getNativePath();
       } else {
           theImagePath = theImage;
       }
   } else {
       theImagePath = null;
   }
   
   Social.activityView({
        text: L("share_beer_name") + " " + args.name,
        image: theImagePath,
        removeIcons:"airdrop,print,copy,contact,camera"
   });  
   //Ti.API.info("module is => " + Social);   
   //Ti.API.info("Twitter available: " + Social.isTwitterSupported());
   //Ti.API.info("Facebook available: " + Social.isFacebookSupported());   
};

function deleteBeer() {
    var yesButton = L("delete_beer_yes");
    var cancelButton = L("delete_beer_no");
    
    var deleteDialog = Ti.UI.createAlertDialog({
       id: "deleteDialog",
       title: L("delete_beer_title"),
       message: L("delete_beer_message"),
       cancel: "0",
       buttonNames: [
          cancelButton, yesButton
       ] 
    });
    deleteDialog.show();   
    
    deleteDialog.addEventListener("click", confirmDeleteBeer);
}

function confirmDeleteBeer(e) {
    if (e.index === 1) {
        var beers = Alloy.Collections.beers;
        var theBeer = beers.where({"alloy_id": args.alloy_id})[0];     
        theBeer.destroy({success: function (model, response) {
            $.BeerDetail.close();    
        }});   
    }
};
