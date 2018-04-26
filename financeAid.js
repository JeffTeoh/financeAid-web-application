$(document).ready(function(){
    //toggle sidebar when button clicked
    $('.sidebar-toggle').on('click', function(){
        $('.sidebar').toggleClass('toggled');
        if ($('.sidebar').hasClass('toggled')) {
            $('.sidebar-toggleright').show();
            $("#addRecordBtn").css("display", "block");
            $(".sidebar").css("min-height", "100vh");            
        } else {
            $('.sidebar-toggleright').hide();
            $("#sidebar-right").css("display", "none");
            $("#addRecordBtn").css("display", "none");
            if ($(window).width() <= 320) {
                $(".sidebar").css("min-height", "152vh");
            } else
            if ($(window).width() < 768) {
                $(".sidebar").css("min-height", "145vh");
            } else 
            if ($(window).width() < 1200) {
                $(".sidebar").css("min-height", "120vh");
            }
        }
    });

    $(".sidebar-toggleright").on('click', function(){
        $(".sidebar-right").toggle();
    });

    if ($(window).width() < 1200) {
        $("#sidebar").addClass("toggled");
        $("#sidebar-right").css("display", "none");
        $(".nav-item").removeClass("float-left");
        $("#monthPicker").on('click', function(){
            $("#sidebar-right").css("display", "none");
        });
        $("#chartContainer").css("height", "300px");
        $("#categories-btn-group").css("overflow", "scroll");
    }
    else {
        $("#sidebar").removeClass("toggled");
        $("#sidebar-right").css("display", "block");
        $(".middleicon").css("line-height", "1.2");
        $("#chartContainer").css("height", "450px");
    }    
    
    //hide side bar while resize
    $(window).resize(function(){
        if ($(this).width() < 1200) {
            $('.sidebar-toggleright').show();
            $("#sidebar").addClass("toggled");
            $("#sidebar-right").css("display", "none");
            $(".chart").css("height", "500px");
            $("#chartContainer").css("height", "300px");
            $(".nav-item").removeClass("float-left");
            $("#categories-btn-group").css("overflow", "scroll");
        }
        else {
            $('.sidebar-toggleright').hide();
            $("#sidebar").removeClass("toggled");
            $("#sidebar-right").css("display", "block");
            $(".nav-item").addClass("float-left");
            $("#chartContainer").css("height", "450px");
        }
    });

    //sort the record list
    $.fn.animateRotate = function(angle, duration, easing, complete) {
        return this.each(function() {
            var $elem = $(this);

            $({deg: 0}).animate({deg: angle}, {
            duration: duration,
            easing: easing,
            step: function(now) {
                $elem.css({
                transform: 'rotate(' + now + 'deg)'
                });
            },
            complete: complete || $.noop
            });
        });
    };

    $("#sorting").on('click', function(){
        $("#sorting > i").animateRotate(270);
        var list = $("ul#expenseList li").get().reverse();
        $("ul#expenseList").empty();
        $.each(list, function(i){
            $("ul#expenseList").append('<li class="list-group-item nopadding">'+list[i].innerHTML+'</li>');
        });
    });

    //return value for toggle switch
    $("#bankFilter").on('click', function(){
        $("#cashFilter").removeAttr("checked");
        if ($("#bankFilter").attr('checked')) {
            $("#bankFilter").removeAttr("checked");
        }
        else {
            $("#bankFilter").attr("checked", "checked");
        }
    });

    $("#cashFilter").on('click', function(){
        $("#bankFilter").removeAttr("checked");
        if ($("#cashFilter").attr('checked')) {
            $("#cashFilter").removeAttr("checked");
        }
        else {
            $("#cashFilter").attr("checked", "checked");
        }
    });

    $("#filter").on('click', function(){
        $("#filter-menu").slideToggle('fast', function(){
            if($("#filter-menu").is(":hidden")) {
                $("#filter").css("color", "#4c4c4c");
                $("#filter").css("background", "transparent");

                //perform filter function
                var bankChecked = $("#bankFilter").attr('checked');
                var cashChecked = $("#cashFilter").attr('checked');

                if ($("#filter-condition").is(":contains('Filter')") && (bankChecked != "checked" && cashChecked != "checked")) {
                    $("#defaultView").css("display", "block");
                    $("#filterApplied").attr("style", "display: none !important;");
                }
                else {
                    $("#defaultView").css("display", "none");
                    $("#filterApplied").css("display", "block");
                }

                /*default list*/
                if ((bankChecked != "checked" && cashChecked != "checked") && $("#filter-condition").is(":contains('Filter')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayEntArray = [];
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayFoodArray = [];
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayVehArray = [];
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                /*Only categories been selected*/
                //Entertainment & Food
                else if ((bankChecked != "checked" && cashChecked != "checked") && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Foods and Drinks')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Foods and Drinks")) {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayEntArray = [];
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayFoodArray = [];
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Entertainment & Vehicle
                else if ((bankChecked != "checked" && cashChecked != "checked") && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Vehicle")) {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayEntArray = [];
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayVehArray = [];
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Food & Vehicle
                else if ((bankChecked != "checked" && cashChecked != "checked") && ($("#filter-condition").is(":contains('Foods and Drinks')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Foods and Drinks" || expCat == "Vehicle")) {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayFoodArray = [];
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayVehArray = [];
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //only Entertainment
                else if ((bankChecked != "checked" && cashChecked != "checked") && $("#filter-condition").is(":contains('Entertainment')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Entertainment") {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayEntArray = [];
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayEntArray.push(expenseObj);
                                        cardEntObj[position] = dayEntArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //only Foods
                else if ((bankChecked != "checked" && cashChecked != "checked") && $("#filter-condition").is(":contains('Foods and Drinks')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Foods and Drinks") {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayFoodArray = [];
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayFoodArray.push(expenseObj);
                                        cardFoodObj[position] = dayFoodArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //only Vehicle
                else if ((bankChecked != "checked" && cashChecked != "checked") && $("#filter-condition").is(":contains('Vehicle')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Vehicle") {
                                    //fetch day of date for position in array
                                    var position = moment(expDate).format("MMM DD");
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                        dayArray = [];
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayArray.push(expenseObj);
                                        cardObj[position] = dayArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                    //fetch category for position in array
                                    var position = expCat;
                                    //check if no empty array and records with same date, add into array and then object
                                    if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                        dayVehArray = [];
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                    //initialise and add to card object if any single records in one day
                                    else {
                                        dayVehArray.push(expenseObj);
                                        cardVehObj[position] = dayVehArray;
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                /*Bank and categories selected*/
                //Bank + Entertainment & Food
                else if (bankChecked == "checked" && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Foods and Drinks')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Foods and Drinks")) {
                                    if (expAcc == "Bank") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Bank + Entertainment & Vehicle
                else if (bankChecked == "checked" && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Vehicle")) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }                                
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Bank + Food & Vehicle
                else if (bankChecked == "checked" && ($("#filter-condition").is(":contains('Foods and Drinks')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Foods and Drinks" || expCat == "Vehicle")) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Bank + Entertainment
                else if (bankChecked == "checked" && $("#filter-condition").is(":contains('Entertainment')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Entertainment") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Bank + Foods
                else if (bankChecked == "checked" && $("#filter-condition").is(":contains('Foods and Drinks')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Foods and Drinks") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Bank + Vehicle
                else if (bankChecked == "checked" && $("#filter-condition").is(":contains('Vehicle')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Vehicle") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                /*Cash and categories selected*/
                //Cash + Entertainment & Food
                else if (cashChecked == "checked" && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Foods and Drinks')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Foods and Drinks")) {
                                    if (expAcc == "Cash") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Cash + Entertainment & Vehicle
                else if (cashChecked == "checked" && ($("#filter-condition").is(":contains('Entertainment')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Entertainment" || expCat == "Vehicle")) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }                                
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }

                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Cash + Food & Vehicle
                else if (cashChecked == "checked" && ($("#filter-condition").is(":contains('Foods and Drinks')") && $("#filter-condition").is(":contains('Vehicle')"))) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && (expCat == "Foods and Drinks" || expCat == "Vehicle")) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Cash + Entertainment
                else if (cashChecked == "checked" && $("#filter-condition").is(":contains('Entertainment')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Entertainment") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Cash + Foods
                else if (cashChecked == "checked" && $("#filter-condition").is(":contains('Foods and Drinks')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Foods and Drinks") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //Cash + Vehicle
                else if (cashChecked == "checked" && $("#filter-condition").is(":contains('Vehicle')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if ((firebaseMonth == validMonth && firebaseYear == validYear) && expCat == "Vehicle") {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                /*Only account or categories been selected*/
                //only Bank
                else if (bankChecked == "checked" && $("#filter-condition").is(":contains('Filter')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Bank") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
                //only Cash
                else if (cashChecked == "checked" && $("#filter-condition").is(":contains('Filter')")) {
                    if ($("#sumByDate").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseObj').orderByChild('expenseDate');
                        var expenseObj;
                        var cardObj = {};
                        var dayArray = [];
                        //index for each card item
                        var i = 1;
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch day of date for position in array
                                        var position = moment(expDate).format("MMM DD");
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayArray.length != 0 && dayArray[0].expenseDate != expenseObj.expenseDate) {
                                            dayArray = [];
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayArray.push(expenseObj);
                                            cardObj[position] = dayArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardObj) {
                                if (cardObj.hasOwnProperty(key)) {
                                    var cardHeaderDate = key;
                                    var recordList = cardObj[key];
                                    var cardText = '';
                                    var x; //counter

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + recordList[x].expenseCategory + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderDate + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse show" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                    i += 1;
                                }
                            }
                        });
                    }
                    else if ($("#sumByCat").hasClass('active')) {
                        $('#expenseList li').remove();
                        var expenseRef = firebase.database().ref('expenseCat/Entertainment').orderByChild('expenseDate');
                        var expenseObj;
                        var cardEntObj = {};
                        var dayEntArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayEntArray.length != 0 && dayEntArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayEntArray = [];
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayEntArray.push(expenseObj);
                                            cardEntObj[position] = dayEntArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardEntObj) {
                                if (cardEntObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardEntObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 1;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Foods and Drinks').orderByChild('expenseDate');
                        var expenseObj;
                        var cardFoodObj = {};
                        var dayFoodArray = [];        
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayFoodArray.length != 0 && dayFoodArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayFoodArray = [];
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayFoodArray.push(expenseObj);
                                            cardFoodObj[position] = dayFoodArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardFoodObj) {
                                if (cardFoodObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardFoodObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 2;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                        var expenseRef = firebase.database().ref('expenseCat/Vehicle').orderByChild('expenseDate');
                        var expenseObj;
                        var cardVehObj = {};
                        var dayVehArray = [];
                        expenseRef.on("value", function(snapshot) {
                            snapshot.forEach(function(childSnapshot){
                                expenseObj = childSnapshot.val();
                                var expDate = expenseObj.expenseDate;
                                var expAcc = expenseObj.expenseAccount;
                                var expCat = expenseObj.expenseCategory;
                                var expAmt = parseFloat(expenseObj.expenseAmount);
                                var currentSelectedMonth = document.getElementById("monthPicker").value;
                                //compare month of record with current selected month
                                var firebaseMonth = expDate.substr(0, 2);
                                var firebaseYear = expDate.substr(-4);
                                var validMonth = currentSelectedMonth.substr(-2);
                                var validYear = currentSelectedMonth.substr(0, 4);
                                if (expAcc == "Cash") {
                                    if (firebaseMonth == validMonth && firebaseYear == validYear) {
                                        //fetch category for position in array
                                        var position = expCat;
                                        //check if no empty array and records with same date, add into array and then object
                                        if (dayVehArray.length != 0 && dayVehArray[0].expenseCategory != expenseObj.expenseCategory) {
                                            dayVehArray = [];
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                        //initialise and add to card object if any single records in one day
                                        else {
                                            dayVehArray.push(expenseObj);
                                            cardVehObj[position] = dayVehArray;
                                        }
                                    }
                                }
                            });
                            //print out object for card items
                            for (var key in cardVehObj) {
                                if (cardVehObj.hasOwnProperty(key)) {
                                    var cardHeaderCat = key;
                                    var recordList = cardVehObj[key];
                                    var cardText = '';
                                    var x; //counter
                                    //index for each card item
                                    var i = 3;

                                    var dailyTotalHeader = 0;
                                    for (x = 0; x < recordList.length; x++){
                                        var cardTextAmt = parseFloat(recordList[x].expenseAmount);
                                        dailyTotalHeader += cardTextAmt;
                                        cardText += '<p>' + recordList[x].expenseDate + '</p>' + 
                                                    '<p>' + recordList[x].expenseAccount + '</p>' + 
                                                    '<p>' + 'RM' + cardTextAmt.toFixed(2) + '</p>' + '<br>';
                                    }

                                    $('#expenseList').append(
                                    '<li class="list-group-item nopadding">' + 
                                        '<div class="card">' + 
                                            '<div class="card-header">' + 
                                                '<a data-toggle="collapse" href="#collapse-item' + i + '" aria-expanded="true" aria-controls="collapse-item" id="heading-item' + i + '" class="d-block" style="text-decoration: none;color: black;">' + 
                                                    '<b>' + cardHeaderCat + '</b>' + 
                                                    '<span class="float-right">RM' + (dailyTotalHeader).toFixed(2) + '</span>' +
                                                '</a>' + 
                                            '</div>' + 
                                            '<div id="collapse-item' + i + '" class="collapse" aria-labelledby="heading-item' + i + '">' + 
                                                '<div class="card-body">' +
                                                    '<div class="card-text">' + 
                                                        cardText +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>' +
                                    '</li>');
                                }
                            }
                        });
                    }
                }
            }
            else {
                $("#filter").css("color", "white");
                $("#filter").css("background", "#4c4c4c");
            }
        });
    });

    $("#allCat").on('click', function(){
        $("#selectClass").css('display', 'none');
        $("#filterEnt").remove(":contains('Entertainment')");
        $("#filterFood").remove(":contains('Foods and Drinks')");
        $("#filterVeh").remove(":contains('Vehicle')");
        $("#filter-condition span").remove();
        $("#filter-condition").append("<span id='default-filter'>Filter</span>");

        //reset filter div
        $("#selectedEnt").remove(":contains('Entertainment')");
        $("#selectedFood").remove(":contains('Foods and Drinks')");
        $("#selectedVeh").remove(":contains('Vehicle')");     
    });

    $("#selectCat").on('click', function(){
        $("#selectClass").css('display', 'block');
    });
    
    $("#selectEnt").on('click', function(){
        if ($("#selectedCategory").is(":contains('Entertainment')")) {
            $("#selectedEnt").remove(":contains('Entertainment')");
            $("#filterEnt").remove(":contains('Entertainment')");
            if($("#filter-condition").is(":empty")) {
                $("#filter-condition").append("<span id='default-filter'>Filter</span>");
            }
            else {
                $("#filter-condition span").first().html(function(i, old){
                    return old.replace(', ', '');
                });
            }
        }
        else {
            if ($("#filter-condition > span").length > 1) {
                alert ("Please select All category");
            }
            else {
                $("#selectedCategory").append('<div id="selectedEnt" class="d-inline-block p-1 mr-1" style="background: #2d991f; color: white;">Entertainment</div>');
                if ($("#filter-condition").is(":contains('Filter')")) {
                    $("#default-filter").remove(":contains('Filter')");
                    $("#filter-condition").append("<span id='filterEnt'>Entertainment</span>");
                }
                else {
                    $("#filter-condition").append("<span id='filterEnt'>, Entertainment</span>");
                }
            }            
        }
    });
    
    $("#selectFood").on('click', function(){
        if ($("#selectedCategory").is(":contains('Foods and Drinks')")) {
            $("#selectedFood").remove(":contains('Foods and Drinks')");
            $("#filterFood").remove(":contains('Foods and Drinks')");
            if($("#filter-condition").is(":empty")) {
                $("#filter-condition").append("<span id='default-filter'>Filter</span>");
            }
            else {
                $("#filter-condition span").first().html(function(i, old){
                    return old.replace(', ', '');
                });
            }
        }
        else {
            if ($("#filter-condition > span").length > 1) {
                alert ("Please select All category");
            }
            else {
                $("#selectedCategory").append('<div id="selectedFood" class="d-inline-block p-1 mr-1" style="background: #2d991f; color: white;">Foods and Drinks</div>');
                if ($("#filter-condition").is(":contains('Filter')")) {
                    $("#default-filter").remove(":contains('Filter')");
                    $("#filter-condition").append("<span id='filterFood'>Foods and Drinks</span>");
                }
                else {
                    $("#filter-condition").append("<span id='filterFood'>, Foods and Drinks</span>");
                }
            }
        }
    });
    
    $("#selectVeh").on('click', function(){
        if ($("#selectedCategory").is(":contains('Vehicle')")) {
            $("#selectedVeh").remove(":contains('Vehicle')");
            $("#filterVeh").remove(":contains('Vehicle')");
            if($("#filter-condition").is(":empty")) {
                $("#filter-condition").append("<span id='default-filter'>Filter</span>");
            }
            else {
                $("#filter-condition span").first().html(function(i, old){
                    return old.replace(', ', '');
                });
            }
        }
        else {
            if ($("#filter-condition > span").length > 1) {
                alert ("Please select All category");
            }
            else {
                $("#selectedCategory").append('<div id="selectedVeh" class="d-inline-block p-1 mr-1" style="background: #2d991f; color: white;">Vehicle</div>');
                if ($("#filter-condition").is(":contains('Filter')")) {
                    $("#default-filter").remove(":contains('Filter')");
                    $("#filter-condition").append("<span id='filterVeh'>Vehicle</span>");
                }
                else {
                    $("#filter-condition").append("<span id='filterVeh'>, Vehicle</span>");
                }
            }
        }
    });
});