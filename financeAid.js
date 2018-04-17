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
    }
    else {
        $("#sidebar").removeClass("toggled");
        $("#sidebar-right").css("display", "block");
        $(".middleicon").css("line-height", "1.2");
    }    
    
    //hide side bar while resize
    $(window).resize(function(){
        if ($(this).width() < 1200) {
            $('.sidebar-toggleright').show();
            $("#sidebar").addClass("toggled");
            $("#sidebar-right").css("display", "none");
            $(".chart").css("height", "500px");
            $(".nav-item").removeClass("float-left");
        }
        else {
            $('.sidebar-toggleright').hide();
            $("#sidebar").removeClass("toggled");
            $("#sidebar-right").css("display", "block");
            $(".nav-item").addClass("float-left");
        }
    });
    
});