$(document).ready(function(){
    //toggle sidebar when button clicked
    $('.sidebar-toggle').on('click', function(){
        $('.sidebar').toggleClass('toggled');
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
            $("#sidebar").addClass("toggled");
            $("#sidebar-right").css("display", "none");
        }
        else {
            $("#sidebar").removeClass("toggled");
            $("#sidebar-right").css("display", "block");
        }
    });
      
});