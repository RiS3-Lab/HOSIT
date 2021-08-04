const Functions = require("../include/functions")
const Puppeteer = require('puppeteer');


/**
 * Class to connect identity with custom functions (Class {@link Functions}) in order to avoid code
 * repetitions
 */
class SimpleController {

    /**
     * constructor
     *
     * @param  {Identity} identity      Identity to use
     * @param  {String} endpoint=null WebSocket-Endpoint
     * @return {Controller}  Controller-Object
     */
    constructor(identity, endpoint = null) {
        // Add identity
        this._identity = identity;

        // Websocket-Endpoint
        this._endpoint = endpoint;

        // Current page-tab
        this._page = null;

        // Browser instance
        this._browser = null;
    }


    /**
     *  Connect Identity with custom functions
     */

    /**
     * Initiate browser and open new tab. The tab is focused.
     *
     * @param  {string} executablePath="" Path to a Chromium or Chrome executable
     * to run instead of the standard Chromium included in Puppeteer. Normal
     * bundled version will be started, if not set.
     * @return {void}
     * @category async
     */
    async init(executablePath = "") {
        // Init Browser with given Endpoint
        let init = await Functions.init(Puppeteer, this._endpoint, executablePath);

        // Save returned values
        this._page = init.page;
        this._frame = null;
        this._pages = [init.page];
        this._browser = init.browser;
    }


    /**
     * Searches for inline frame with given URL start in the current
     * tab and focuses it for following events (typeFrame or clickFrame)
     *
     * @param  {String} url Beginning of URL of targeted iFrame inside the current
     * page tab
     * @return {boolean}     True: Frame has been found, False: Frame has not been found
     * @category async
     */
    async focusFrame(url) {
        // Search for Frame
        let frame = await Functions.getFrame(this._page, url);

        // Is frame has been found
        if (frame != null) {
            // Set current Frame to the found one
            this._frame = frame;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Same as focusFrame() but focuses on the iFrame with the given selector
     */
    async focusFrameSelector(selector) {
        const handle = await this._page.$(selector);
        if (handle === null) {
            return false;
        }

        this._frame = await handle.contentFrame();
        return this._frame !== null;
    }


    /**
     * Types inside the target input element inside the current tab with
     * randomized typing delays defined by the identity
     *
     * @param  {string} selector   Selector ot the target input element. If the
     * selector is not given, the typing events will be executed without focusing
     * the input element.
     * @param  {string} text       Text which should be entered
     * @return {void}
     * @category async
     */
    async type(selector = "", text) {
        await this.type(selector, text);
    }


    /**
     * Types inside the target input element inside the current selected frame
     * with randomized typing delays defined by the identity
     *
     * @param  {string} selector   Selector ot the target input element. If the
     * selector is not given, the typing events will be executed without focusing
     * the input element.
     * @param  {string} text       Text which should be entered
     * @return {void}
     * @category async
     */
    async typeFrame(selector, text) {
        const element = await this._frame.$(selector);
        element.click();
        await element.type(text);
    }

    /**
     * Presses Enter button on current tab with random press and release time
     *
     * @return {void}
     * @category async
     */
    async typeEnter() {
        await Functions.typeEnter(this._page);
    }

    /**
     * Presses Tab button on current tab
     *
     * @return {void}
     * @category async
     */
    async typeTab(page) {
        await Functions.typeTab(this._page);
    }

    /**
     * Presses ESC button
     *
     * @return {type}
     * @category async
     */
    async typeEsc(page) {
        await Functions.typeEsc(this._page);
    }

    /**
     * Click on target element with random deviation around the click position
     * and error handling. Every click is saved as a screenshot.
     *
     * @param  {string} selector Selector of target element
     * @param  {number} delay=true  Random delay between MouseDown und MouseUp event
     * @param  {Boolean} tap=false  Send touchscreen tap instead of MouseClick event
     * @param  {Boolean} topRight=false  Click inside of the top right corner instead
     * of the element's center.
     * @param  {Boolean} doTrigger=false  Manually trigger the click event via JavaScript
     * if error occurred (can happen, if Dropdown menu closed before the click has been
     * executed)
     * @return {void}
     * @category async
     */
    async click(selector, delay = true, tap = false, topRight = false, doTrigger = false) {
        await this._page.click(selector);
    }

    /**
     * Same as click() but also awaits a page navigation. Useful when you click and button that
     * takes you to a new url, but don't want to start waiting for navigation once you've already
     * been taken to the page.
     * @param selector
     * @param delay
     * @param tap
     * @param topRight
     * @param doTrigger
     * @returns {Promise<void>}
     */
    async clickAndWait(selector, delay = true, tap = false, topRight = false, doTrigger = false) {
        await Promise.all([
            this.click(selector),
            this.waitForNavigation()
        ]);
    }

    /**
     * Click on target element of selected frame with error handling.
     * Version for iFrame.
     *
     * @param  {string} selector Selector of target element
     * @return {void}
     * @category async
     */
    async clickFrame(selector) {
        const element = await this._frame.$(selector);
        element.click();
    }

    /**
     * Same as clickAndWait() but clicks a selector in an iFrame
     */
    async clickFrameAndWait(selector) {
        await Promise.all([
            this.clickFrame(selector),
            this._page.waitForNavigation()
        ]);
    }

    /**
     * Hover over targeted element
     *
     * @param  {Page} page     Page object
     * @param  {string} selector Selector of target element
     * @return {void}
     * @category async
     */
    async hover(selector) {
        await this._page.hover(selector);
    }

    /**
     * Wait for visibility of selector on current tab with error error handling
     *
     * @param  {string} selector Selector of target element
     * @param  {boolean} doThrow throws an error instead of invoking the internal
     * errorHandling function
     * @return {void}
     * @category async
     */
    async waitForSelector(selector, doThrow = false) {
        await Functions.waitForSelector(this._page, selector, doThrow);
    }

    /**
     * Selects value of dropdown list inside the current tab with error handling.
     *
     * @param  {string} selector Selector of target element
     * @param  {string} value    Selection value of target value (value="VALUE")
     * @return {void}
     * @category async
     */
    async select(selector, value) {
        await this._page.select(selector, value);
    }

    /**
     * Selects value of dropdown list inside the selected frame with error handling.
     *
     * @param  {string} selector Selector of target element
     * @param  {string} value    Selection value of target value (value="VALUE")
     * @return {void}
     * @category async
     */
    async selectFrame(selector, value) {
        await this._frame.select(selector, value);
    }

    /**
     * Opens URL in current tab
     *
     * @param  {string} url URL
     * @param  {Object} options Navigation parameters
     * @return {void}
     * @category async
     */
    async goto(url, options = {}) {
        await this._page.goto(url, options);
    }

    /**
     * Waits for random time range
     *
     * @param  {number}  time=2000     Average waiting time in milliseconds
     * @param  {number}  random=1000   Maximum deviation from average waiting time
     * in milliseconds
     * @return {void}
     * @category async
     */
    async randomWait(time = 2000, random = 1000) {
        await this._page.waitForTimeout(time);
    }

    /**
     * async waitForNavigation - description
     *
     * @return {void}  description
     * @category async
     */
    async waitForNavigation() {
        await this._page.waitForNavigation();
    }

    /**
     * Create screenshot of page and save it inside the log
     *
     * @param  {Object} page Element from which the screenshot should be taken
     * from [Page, Element, Frame]
     * @param  {string} text Text for the log entry
     * @return {void}
     * @category async
     */
    async logScreenshot(text = "", fullPage = false) {
        await Functions.logScreenshot(this._page, text, fullPage);
    }


    /**
     * Check if selector is visible on page
     *
     * @param  {String} selector Selector of target
     * @return {Boolean}          true: visible, false: not visible
     * @category async
     */
    async isSelectorVisible(selector) {
        return await Functions.isSelectorVisible(this._page, selector);
    }


    /**
     * Scrolls to given selector
     *
     * @param  {String} stopSelector Selector to which the function should scroll
     * @param  {Boolean} wait=true    Wait after half of page is scrolled
     * @return {void}
     * @category async
     */
    async scrollToSelector(stopSelector, wait = true) {
        await Functions.scrollToSelector(this._page, stopSelector, wait);
    }

    /**
     * async scrollToBottom - Scrolls to Bottom of current page (last div-Element).
     *
     * @return {type}  description
     * @category async
     */
    async scrollToBottom() {
        // Get bottom selector
        let bottomSelector = await Functions.getBottomSelector(this._page);

        // Scroll to Selector
        await Functions.scrollDown(this._page, bottomSelector);
    }


    /**
     * Scrolls page up until the selector is visible
     *
     * @param  {string} stopSelector  Selector to which the function should scroll up
     * @param  {boolean} wait=true     Wait after half of page is scrolled
     * @param  {boolean} press=false   true: Scrolling is achieved with long button press of page down-button,
     * false: Scrolling is achieved with several short arrow down button presses
     * @param  {number} minScrolls=11 Minimum number of keyboard presses for scrolling (if press=false)
     * @param  {number} maxScrolls=15 Maximum number of keyboard presses for scrolling (if press=false)
     * @return {void}
     * @category async
     */
    async scrollUp(stopSelector, wait = true, press = false, minScrolls = 11, maxScrolls = 15) {
        await Functions.scrollUp(this._page, stopSelector, wait, press, minScrolls, maxScrolls);
    }

    /**
     * Scrolls page down until the selector is visible
     *
     * @param  {string} stopSelector  Selector to which the function should scroll up
     * @param  {boolean} wait=true     Wait after half of page is scrolled
     * @param  {boolean} press=false   true: Scrolling is achieved with long button press of page down-button,
     * false: Scrolling is achieved with several short arrow down button presses
     * @param  {number} minScrolls=11 Minimum number of keyboard presses for scrolling (if press=false)
     * @param  {number} maxScrolls=15 Maximum number of keyboard presses for scrolling (if press=false)
     * @param  {number} minIterations=0 Minimum number of how many iterations this
     * scrolling have to be repeated (even if element has already been scrolled by)
     * @return {void}
     * @category async
     */
    async scrollDown(stopSelector, wait = true, press = false, minScrolls = 11, maxScrolls = 15, minIterations = 0) {
        await Functions.scrollDown(this._page, wait, press, minScrolls, maxScrolls, minIterations);
    }

    /**
     * Change HTML-DOM value (z.B. Textarea elements)
     *
     * @param  {string} selector  Selektor of target
     * @param  {Sting} text       Value text to which the selected element should
     * be changed
     * @return {void}
     * @category async
     */
    async setValue(selector, text) {
        await Functions.setValue(this._page, selector, text);
    }

    /**
     * Deactivate link invocation behavior inside the browser page with injection
     * of JavaScript
     *
     * @param  {string} selector Target selector of link which should be deactivated
     * @return {void}
     * @category async
     */
    async deactivateLink(page, selector) {
        await Functions.deactivateLink(this._page, selector);
    }

    /**
     * Get Href (link) content of targeted DOM element
     *
     * @param  {string} selector Selector of target
     * @return {string}          Href content
     * @category async
     */
    async getHref(selector) {
        return await Functions.getHref(this._page, selector);
    }

    /**
     * Return random time
     *
     * @param  {number} time   Average time in milliseconds
     * @param  {number} random Maximum deviation from average time in milliseconds
     * @return {number}        Random number inside range [time +/- random]
     */
    getRandomTime(time, random) {
        return Functions.getRandomTime(time, random);
    }

    /**
     * Return random number with seedrandom library
     *
     * @param  {number} to      To
     * @param  {number} from=0  From
     * @return {number}         Random number inside range [from-to]
     */
    getRandomNumber(to, from = 0) {
        return Functions.getRandomNumber(to, from);
    }

    /**
     * Return random boolean value
     *
     * @param  {Number} truePercent=0.5   Probability for returning true
     * (comma value between 0 and 1)
     * @return {Boolean}
     */
    getRandomBoolean(truePercent = 0.5) {
        return Functions.getRandomBoolean(truePercent);
    }

    /**
     * async goBack - Open prior page in browser history of current tab
     *
     * @return {void}
     * @category async
     */
    async goBack() {
        await this._page.goBack();
    }

    /**
     * getPage - Returns current page tab
     *
     * @return {page}  Page-Object
     */
    getPage() {
        return this._page;
    }

    /**
     * getFrame - Returns current selected frame in the page
     *
     * @return {frame}  Frame-Object
     */
    getFrame() {
        return this._frame;
    }

    /**
     * Returns the identity used in this controller
     *
     * @return {Identity}  Identity
     */
    getIdentity() {
        return this._identity;
    }

    /**
     * Solve image captcha inside the page with the help of the Anti-Captcha service.
     * Needs anti-captcha library to work. Library can be downloaded at
     * https://github.com/AdminAnticaptcha/anticaptcha-nodejs/blob/master/anticaptcha.js
     * and the file has to be put into the "lib"-folder of this project.
     *
     * @param  {string} selector  Selector of the Captcha
     * @return {string}           Submitted solution of the Captcha
     * @category async
     */
    async solveCaptcha(selector) {
        return await Functions.solveCaptcha(this._page, selector);
    }

    /**
     * Solve reCAPTCHA inside iFrame with the help of the Anti-Captcha service
     * Needs anti-captcha library to work. Library can be downloaded at
     * https://github.com/AdminAnticaptcha/anticaptcha-nodejs/blob/master/anticaptcha.js
     * and the file has to be put into the "lib"-folder of this project.
     *
     * @param  {string} selector Selector to the reCAPTCHA iframe included inside
     * the given frame element (needs to have URL to reCAPTCHA inside the HTML DOM
     * attribute "src").
     * @return {string}        reCAPTCHA solution string which has to be injected
     * into hidden textarea element before submission of the form.
     * @category async
     */
    async solveRecaptcha(selector) {
        return await Functions.solveRecaptcha(this._iframe, selector);
    }
}

module.exports = Controller;
