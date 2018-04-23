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
            }
            else {
                $("#filter").css("color", "white");
                $("#filter").css("background", "#4c4c4c");
            }
        });
    });

    $("#allCat").on('click', function(){
        $("#selectClass").css('display', 'none');
        $("#excludeClass").css('display', 'none');
    });

    $("#selectCat").on('click', function(){
        $("#selectClass").css('display', 'block');
        $("#excludeClass").css('display', 'none');
    });
    
    $("#excludeCat").on('click', function(){
        $("#selectClass").css('display', 'none');
        $("#excludeClass").css('display', 'block');
    });
    
});