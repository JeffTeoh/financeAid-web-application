$(document).ready(function(){
    //toggle sidebar when button clicked
    $('.sidebar-toggle').on('click', function(){
        $('.sidebar').toggleClass('toggled');
        if ($('.sidebar').hasClass('toggled')) {
            $('.sidebar-toggleright').show();
            $("#addRecordBtn").css("display", "block");
        } else {
            $('.sidebar-toggleright').hide();
            $("#sidebar-right").css("display", "none");
            $("#addRecordBtn").css("display", "none");
        }
    });

    $(".sidebar-toggleright").on('click', function(){
        $(".sidebar-right").toggle();
    });

    if ($(window).width() < 1200) {
        $("#sidebar").addClass("toggled");
        $("#sidebar-right").css("display", "none");
    }
    else {
        $("#sidebar").removeClass("toggled");
        $("#sidebar-right").css("display", "block");
    }
    
    //hide side bar while resize
    $(window).resize(function(){
        if ($(this).width() < 1200) {
            $('.sidebar-toggleright').show();
            $("#sidebar").addClass("toggled");
            $("#sidebar-right").css("display", "none");
            $(".chart").css("height", "500px");
        }
        else {
            $('.sidebar-toggleright').hide();
            $("#sidebar").removeClass("toggled");
            $("#sidebar-right").css("display", "block");
        }
    });
      
});