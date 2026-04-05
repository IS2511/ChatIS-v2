// Make images lazy load
$('#example img').attr('loading', 'lazy');

const FuckingSettings = {
    fonts: [ 'BalooTammudu', 'SegoeUI', 'Roboto', 'Lato', 'NotoSans', 'SourceCodePro',
        'Impact', 'Comfortaa', 'DancingScript', 'IndieFlower', 'OpenSans', 'AlsinaUltrajada'],
    sizes: ['small', 'medium', 'large'],
    strokes: ['thin', 'medium', 'thick', 'thicker'],
    shadows: ['small', 'medium', 'large'],
};

function fadeOption(event) {
    if ($fade_bool.is(':checked')) {
        $fade.removeClass('hidden');
        $fade_seconds.removeClass('hidden');
    } else {
        $fade.addClass('hidden');
        $fade_seconds.addClass('hidden');
    }
}

function sizeUpdate(event) {
    $('link[class="size"]').remove();

    const size = FuckingSettings.sizes[Number($size.val()) - 1]

    // Because when font size changes we need to update the emote scale too bruh
    emoteScaleUpdate();

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        class: "size",
        href: `styles/size_${size}.css`
    }).appendTo("head");
}

function fontUpdate(event) {
    $('link[class="font"]').remove();
    // $fontCustom.addClass("disabled");
    $example.attr('style', '');
    $fontCustom.attr('disabled', true);
    // $fontCustom.parent().addClass("hidden");

    if (Number($font.val()) === 0) {
        $fontCustom.attr('disabled', false);
        $example.attr('style', 'font-family:"'+$fontCustom.val()+'"');
    } else {
        const font = FuckingSettings.fonts[Number($font.val()) - 1]

        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            class: "font",
            href: `styles/font_${font}.css`
        }).appendTo("head");
    }
}

function fontCustomUpdate(event) {
    $example.attr('style', 'font-family:"'+$fontCustom.val()+'"');
    // $("#example").css("font-family", "'"+$fontCustom.val()+"';")
}

function textStrokeViaShadow(thickness, color = 'black') {
    const shadowLayers = [];

    for (let angle = 0; angle < 2 * Math.PI; angle += 1 / thickness) {
        const x = parseFloat((Math.cos(angle) * thickness).toFixed(5));
        const y = parseFloat((Math.sin(angle) * thickness).toFixed(5));
        shadowLayers.push(`${x}px ${y}px ${color}`);
    }

    return shadowLayers.join(', ');
}

function strokeUpdate(event) {
    $('link[class="stroke"], style[class="stroke"]').remove();

    if ($stroke.val() === "0") return // if "off is selected"

    const thickness = Number($stroke.val());

    $("<style/>", {
        type: "text/css",
        class: "stroke",
        text: `#example { text-shadow: ${textStrokeViaShadow(thickness)}; }`
    }).appendTo("head");
}

function shadowUpdate(event) {
    $('link[class="shadow"]').remove();

    if ($shadow.val() === "0") return // if "off" is selected

    const shadow =  FuckingSettings.shadows[Number($shadow.val()) -1]

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        class: "shadow",
        href:  `styles/shadow_${shadow}.css`
    }).appendTo("head");
}


function emoteScaleUpdate(event) {
    // Check if $emoteScale is not empty and is not a number
    let emoteScale = parseFloat($emoteScale.val());
    if ($emoteScale.val() !== "" && (isNaN(emoteScale) || emoteScale < 0 || emoteScale > 3)) {
        $emoteScale.addClass('input-bad');
    } else {
        $emoteScale.removeClass('input-bad');
    }

    if (emoteScale > 3)
        emoteScale = 3;
    else if (emoteScale < 0)
        emoteScale = 0;
    else if (isNaN(emoteScale))
        emoteScale = 1;

    // Get the font size select
    const size = FuckingSettings.sizes[Number($size.val()) - 1]
    let emoteHeight = 0;
    switch (size) {
        case 'small':
            emoteHeight = 25;
            break;
        case 'medium':
            emoteHeight = 42;
            break;
        case 'large':
            emoteHeight = 60;
            break;
    }
    $("#example .emote").css("height", `${emoteHeight * emoteScale}px`);
}

function capsUpdate(event) {
    if ($small_caps.is(':checked')) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            class: "small_caps",
            href: "styles/variant_SmallCaps.css"
        }).appendTo("head");
    } else {
        $('link[class="small_caps"]').remove();
    }
}

function nlanUpdate(event) {
    if ($nl_after_name.is(':checked')) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            class: "nl_after_name",
            href: "styles/variant_NLAfterName.css"
        }).appendTo("head");
    } else {
        $('link[class="nl_after_name"]').remove();
    }
}

function hideNamesUpdate(event) {
    if ($hideNames.is(':checked')) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            class: "hideNames",
            href: "styles/variant_hideNames.css"
        }).appendTo("head");
    } else {
        $('link[class="hideNames"]').remove();
    }
}

function markdownUpdate(event) {
    if ($markdown.is(':checked')) {
        // $("<link/>", {
        //     rel: "stylesheet",
        //     type: "text/css",
        //     class: "markdown",
        //     href: "styles/variant_???.css"
        // }).appendTo("head");
    } else {
        // $('link[class="markdown"]').remove();
    }
}

function hideSpecialBadgesUpdate(event) {
    if ($special_badges.is(':checked')) {
        $('img[class="badge special"]').addClass('hidden');
        $show_homies.prop('checked', false);
        $show_homies.css('opacity', '0.5');
    } else {
        $('img[class="badge special hidden"]').removeClass('hidden');
        $show_homies.css('opacity', '');
    }
}

function showHomiesUpdate(event) {
    if ($show_homies.is(':checked')) {
        if ($special_badges.is(':checked'))
            $show_homies.prop('checked', false);
    } else {

    }
}

function generateURL() {
    let generatedUrl = 'https://' + window.location.hostname + '/v2/?channel=' + $channel.val().trim();
    if ($animate.is(':checked')) generatedUrl += '&animate=true';
    if ($bots.is(':checked')) generatedUrl += '&bots=true';
    if ($fade_bool.is(':checked')) generatedUrl += '&fade=' + $fade.val();
    generatedUrl += '&size=' + $size.val();
    generatedUrl += '&font=' + $font.val();
    if (parseInt($font.val()) === 0) generatedUrl += '&fontCustom=' + $fontCustom.val();
    if ($special_badges.is(':checked')) generatedUrl += '&hide_special_badges=true';
    if ($show_homies.is(':checked')) generatedUrl += '&show_homies=true';
    if ($stroke.val() !== '0') generatedUrl += '&stroke=' + $stroke.val();
    if ($shadow.val() !== '0') generatedUrl += '&shadow=' + $shadow.val();
    if ($emoteScale.val() !== '' && !$emoteScale.hasClass('input-bad'))
        generatedUrl += '&emoteScale=' + parseFloat($emoteScale.val());
    if ($small_caps.is(':checked')) generatedUrl += '&small_caps=true';
    if ($nl_after_name.is(':checked')) generatedUrl += '&nl_after_name=true';
    if ($hideNames.is(':checked')) generatedUrl += '&hide_names=true';
    if ($markdown.is(':checked')) generatedUrl += '&markdown=true';
    if ($botNames.val() !== '') generatedUrl += '&botNames=' + $botNames.val();

    return generatedUrl;
}

function updateURL(event) {
    let generatedUrl = generateURL();
    $example.attr('src', generatedUrl);
}
function showURL(event) {
    event.preventDefault();

    let generatedUrl = generateURL();

    $example.attr('src', generatedUrl);
    $url.val(generatedUrl);
    // $generator.addClass('hidden');
    $result.removeClass('hidden');
}

function changePreview(event) {
    if ($example.hasClass("white")) {
        $example.removeClass("white");
        $brightness.attr('src', "img/light.png");
    } else {
        $example.addClass("white");
        $brightness.attr('src', "img/dark.png");
    }
}

function copyUrl(event) {
    navigator.clipboard.writeText($url.val());

    $alert.css('visibility', 'visible');
    $alert.css('opacity', '1');
    setTimeout(function() {
        $alert.css('opacity', '0');
        setTimeout(function() {
            $alert.css('visibility', 'hidden');
        }, 200);
    }, 2000);
}

function showUrl(event) {
    $alert.css('opacity', '0');
    setTimeout(function() {
        $alert.css('visibility', 'hidden');
    }, 200);
}

function resetForm(event) {
    $channel.val("");
    $animate.prop('checked', false);
    $bots.prop('checked', false);
    $fade_bool.prop('checked', false);
    $fade.addClass('hidden');
    $fade_seconds.addClass('hidden');
    $fade.val("30");
    $special_badges.prop('checked', false);
    $show_homies.prop('checked', false);
    $('img[class="badge special hidden"]').removeClass('hidden');
    $small_caps.prop('checked', false);
    $('link[class="small_caps"]').remove();
    $nl_after_name.prop('checked', false);
    $hideNames.prop('checked', false);
    $('link[class="nl_after_name"]').remove();
    $markdown.prop('checked', false);
    $md_image.addClass('hidden');
    $md_image.prop('checked', false);
    $result.addClass('hidden');
    $generator.removeClass('hidden');
    showUrl();
}

const $updater = $("#updater");
const $generator = $("form[name='generator']");
const $channel = $('input[name="channel"]');
const $animate = $('input[name="animate"]');
const $bots = $('input[name="bots"]');
const $fade_bool = $("input[name='fade_bool']");
const $fade = $("input[name='fade']");
const $fade_seconds = $("#fade_seconds");
const $special_badges = $("input[name='special_badges']")
const $show_homies = $("input[name='show_homies']")
const $small_caps = $("input[name='small_caps']");
const $nl_after_name = $("input[name='nl_after_name']");
const $hideNames = $("input[name='hide_names']");
const $markdown = $("input[name='markdown']");
const $md_image = $("#md_image");
const $size = $("select[name='size']");
const $font = $("select[name='font']");
const $fontCustom = $("input[name='fontCustom']");
const $stroke = $("select[name='stroke']");
const $shadow = $("select[name='shadow']");
const $emoteScale = $("input[name='emoteScale']");
const $botNames = $("input[name='botNames']");
const $brightness = $("#brightness");
const $example = $('#example');
const $result = $("#result");
const $url = $('#url');
const $alert = $("#alert");
const $reset = $("#reset");

$fade_bool.change(fadeOption);
$size.change(sizeUpdate);
$font.change(fontUpdate);
$fontCustom.on('input', fontCustomUpdate);
$stroke.change(strokeUpdate);
$shadow.change(shadowUpdate);
$emoteScale.on('input', emoteScaleUpdate);
$special_badges.change(hideSpecialBadgesUpdate);
$show_homies.change(showHomiesUpdate);
$small_caps.change(capsUpdate);
$nl_after_name.change(nlanUpdate);
$hideNames.change(hideNamesUpdate);
$markdown.change(markdownUpdate);
// $botNames.change(botNamesUpdate);
$updater.click(updateURL);
$generator.submit(showURL);
$brightness.click(changePreview);
$url.click(copyUrl);
$alert.click(showUrl);
$reset.click(resetForm);
