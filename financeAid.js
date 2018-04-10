$(document).ready(function(){
    //toggle sidebar when button clicked
    $('.sidebar-toggle').on('click', function(){
        $('.sidebar').toggleClass('toggled');
    });
    
    //hide side bar while resize
    $(window).resize(function(){
        if ($(this).width() < 1200) {
            $("#sidebar").addClass("toggled");
        }
        else {
            $("#sidebar").removeClass("toggled");
        }
    });
      
});