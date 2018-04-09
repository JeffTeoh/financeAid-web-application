$(document).ready(function(){
    //toggle sidebar when button clicked
    $('.sidebar-toggle').on('click', function(){
        $('.sidebar').toggleClass('toggled');
    });

    //toggle sidebar when button clicked
    $('.sidebar-toggleright').on('click', function(){
        $('.sidebar-right').toggle(200);
    });
});