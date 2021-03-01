import jQuery from "jquery";
import slick from "slick-carousel";
import Validate from "jquery-validation";

window.$ = window.jQuery = jQuery;

$(".testimonials").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    mobileFirst: true,
    swipe: true,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
            },
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            },
        },
        {
            breakpoint: 325,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
            },
        },
    ],
});

$(function () {
    $("#Navbar-Menu button").on("click", function () {
        $(".Navigation_Link").toggleClass("isOpen");
    });

    $(function () {
        $("form[name='newsletter']").validate({
            rules: {
                email: "required",
                email: {
                    required: true,
                    email: true,
                },
            },
            messages: {
                email: "Please enter a valid email address",
            },
            submitHandler: function (form) {
                form.submit();
            },
        });
    });
});
