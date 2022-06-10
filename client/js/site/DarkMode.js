// Dark Mode

//enable/disable stylesheets
function enableStylesheet(node) {
    node.rel = 'stylesheet';
}  
function disableStylesheet(node) {
    node.rel = 'alternate stylesheet';
}

//enable dark mode
function enableDarkMode() {

    //store dark mode value
    localStorage.setItem('dark-mode', 'true');

    //disable dark mode css
    enableStylesheet(document.getElementById('dark-stylesheet'));

    //add dark class to body
    $('body').addClass("dark");
};

//disable dark mode
function disableDarkMode() {
    //get body
    let $body = $('body');

    //store dark mode value
    localStorage.setItem('dark-mode', 'false');

    //disable dark mode css
    disableStylesheet(document.getElementById('dark-stylesheet'));

    //remove dark class from body
    $body.removeClass("dark");
};

//detect dark or light mode on load
$(window).on('load', () => {

    //init dark mode value
    if (localStorage.getItem('dark-mode') === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

        console.log('dark mode is set')

        //enable dark mode
        enableDarkMode();

        //set dark mode switch to on
        $('#dark-mode-switch').prop('checked', true);
    }

    //get dark mode value
    else if (localStorage.getItem('dark-mode') === 'true') {

        //enable dark mode css
        enableStylesheet(document.getElementById('dark-stylesheet'));

        //add dark class to body
        $('body').addClass('dark');

        //set dark mode switch to on
        $('#dark-mode-switch').prop('checked', true);
    };
});

//detect dark mode toggle
$('#dark-mode-switch').change(() => {
    let $body = $('body');

    //toggle off
    if ($body.hasClass("dark")) {
        disableDarkMode();
    }

    //toggle on
    else {
        enableDarkMode();
    };
});