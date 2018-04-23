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

    $("#filter").on('click', function(){
        $("#filter-menu").slideToggle('fast', function(){
            if($("#filter-menu").is(":hidden")) {
                $("#filter").css("color", "#4c4c4c");
                $("#filter").css("background", "transparent");

                //perform filter function
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