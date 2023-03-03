/*********
Display: React,
Event handling: Reactive JS
Status handling: Redux
**********/

/*********
* REACT
**********/
const Container = ({ hue, saturation, lightness, red, green, blue, hex, setHue, setSaturation, setLightness }) => {
    return <div id='container'>
        <Hue hue={hue} saturation={saturation} lightness={lightness} setHue={setHue} />
        <Saturation hue={hue} saturation={saturation} lightness={lightness} setSaturation={setSaturation} />
        <Lightness hue={hue} saturation={saturation} lightness={lightness} setLightness={setLightness} />
        <div id='footer'>
            <div>
                {`hsl(${hue}, ${saturation}%, ${lightness}%)`}
            </div>
            <div>
                {`rgb(${red}, ${green}, ${blue})`}
            </div>
            <div>
                {hex}
            </div>
        </div>
    </div>;
};

class Hue extends React.Component {
    constructor({ hue, saturation, lightness, setHue }) {
        super({ hue, saturation, lightness, setHue });

        const padding = 60;
        const innerSize = 300;
        this.radius = innerSize / 2;
        this.outterSize = innerSize + padding;
        this.centerOffset = this.outterSize / 2;

        this.state = {
            dragging: false
        };

        // These are set in the render method
        this.canvas = null;
        this.selector = null;
    }

    render() {
        return (
            <svg ref={(canvas) => { this.canvas = canvas; }}
                width={this.outterSize} height={this.outterSize}
                viewBox={`0 0 ${this.outterSize} ${this.outterSize}`}
                xmlns="http://www.w3.org/2000/svg" version="1.1">
                <g transform={`translate(${this.centerOffset},${this.centerOffset})`}>
                    {Array.from({ length: 360 }, (value, key) => (
                        <HueSlice
                            degree={key}
                            radius={this.radius}
                            color={`hsl(${key}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                            marker={false} />
                    ))}
                    <g ref={(selector) => { this.selector = selector; }}>
                        <HueSlice
                            degree={this.props.hue}
                            radius={this.radius}
                            color={this.state.dragging ? `hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)` : "white"}
                            marker={true} />
                    </g>
                    <text
                        x="10"
                        y="30"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        {this.props.hue}°
                    </text>
                    <text
                        className="label"
                        x="0"
                        y="60"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        Hue
                    </text>
                </g>
            </svg>

        );
    }

    componentDidMount() {
        // Event handling using Reactive JS
        let mouseDowns = Rx.Observable.fromEvent(this.selector, "mousedown");
        let mouseMoves = Rx.Observable.fromEvent(this.canvas, "mousemove");
        let mouseUps = Rx.Observable.fromEvent(this.canvas, "mouseup");
        let mouseLeaves = Rx.Observable.fromEvent(this.canvas, "mouseleave");

        let touchStarts = Rx.Observable.fromEvent(this.selector, "touchstart");
        let touchMoves = Rx.Observable.fromEvent(this.selector, "touchmove");
        let touchEnds = Rx.Observable.fromEvent(this.canvas, "touchend");

        let mouseDrags = mouseDowns.concatMap(clickEvent => {
            const xMouseShouldBe = Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yMouseShouldBe = -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xMouseIs = clickEvent.clientX;
            const yMouseIs = clickEvent.clientY;
            const xMouseDelta = xMouseIs - xMouseShouldBe;
            const yMouseDelta = yMouseIs - yMouseShouldBe;
            return mouseMoves.takeUntil(mouseUps.merge(mouseLeaves)).map(moveEvent => {
                const xRelativeToCenter = moveEvent.clientX - xMouseDelta;
                const yRelativeToCenter = moveEvent.clientY - yMouseDelta;
                const degree = Math.atan(yRelativeToCenter / xRelativeToCenter) * 180 / Math.PI + 90 + (xRelativeToCenter >= 0 ? 0 : 180);
                return parseInt(degree);
            });
        });

        let touchDrags = touchStarts.concatMap(startEvent => {
            startEvent.preventDefault();
            const xTouchShouldBe = Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yTouchShouldBe = -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xTouchIs = startEvent.touches[0].clientX;
            const yTouchIs = startEvent.touches[0].clientY;
            const xTouchDelta = xTouchIs - xTouchShouldBe;
            const yTouchDelta = yTouchIs - yTouchShouldBe;
            return touchMoves.takeUntil(touchEnds).map(moveEvent => {
                moveEvent.preventDefault();
                const xRelativeToCenter = moveEvent.touches[0].clientX - xTouchDelta;
                const yRelativeToCenter = moveEvent.touches[0].clientY - yTouchDelta;
                const degree = Math.atan(yRelativeToCenter / xRelativeToCenter) * 180 / Math.PI + 90 + (xRelativeToCenter >= 0 ? 0 : 180);
                return parseInt(degree);
            });
        });

        let dragStarts = mouseDowns.merge(touchStarts);
        let drags = mouseDrags.merge(touchDrags);
        let dragEnds = mouseUps.merge(mouseLeaves).merge(touchEnds);

        dragStarts.forEach(() => {
            this.setState({ dragging: true });
        });

        drags.forEach(degree => {
            this.props.setHue(degree);
        });

        dragEnds.forEach(() => {
            this.setState({ dragging: false });
        });
    }
}

const HueSlice = ({ degree, color, radius, marker }) => {
    const thickness = marker ? 5 : 1;
    const startX = Math.sin((degree - thickness) / 180 * Math.PI) * radius;
    const startY = - Math.cos((degree - thickness) / 180 * Math.PI) * radius;
    const endX = Math.sin((degree + thickness) / 180 * Math.PI) * radius;
    const endY = - Math.cos((degree + thickness) / 180 * Math.PI) * radius;
    return <path
        className={marker && 'marker'}
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
        stroke={color} />;
};

const Saturation = ({ hue, saturation, lightness, setSaturation }) => {
    const gradient = <linearGradient id="Saturation" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={`hsl(${hue}, 100%, ${lightness}%)`} />
        <stop offset="100%" stopColor={`hsl(${hue}, 0%, ${lightness}%)`} />
    </linearGradient>;
    return <Percentage
        type="Saturation" value={saturation} gradient={gradient}
        hue={hue} saturation={saturation} lightness={lightness}
        set={setSaturation} />;
};

const Lightness = ({ hue, saturation, lightness, setLightness }) => {
    const gradient = <linearGradient id="Lightness" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={`hsl(${hue}, ${saturation}%, 100%)`} />
        <stop offset="50%" stopColor={`hsl(${hue}, ${saturation}%, 50%)`} />
        <stop offset="100%" stopColor={`hsl(${hue}, ${saturation}%, 0%)`} />
    </linearGradient>;
    return <Percentage
        type="Lightness" value={lightness} gradient={gradient}
        hue={hue} saturation={saturation} lightness={lightness}
        set={setLightness} />;
};

class Percentage extends React.Component {
    constructor({ type, value, gradient, hue, saturation, lightness, set }) {
        super({ type, value, gradient, hue, saturation, lightness, set });

        const padding = 60;
        this.padding = padding / 2;
        const innerSize = 300;
        this.innerSize = innerSize;
        this.outterSize = innerSize + padding;
        this.barOffsetX = innerSize - 20;

        this.state = {
            dragging: false
        };

        // These are set in the render method
        this.canvas = null;
        this.selector = null;
    }

    render() {
        return (
            <svg ref={(canvas) => { this.canvas = canvas; }}
                width={this.outterSize} height={this.outterSize}
                viewBox={`0 0 ${this.outterSize} ${this.outterSize}`}
                xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    {this.props.gradient}
                </defs>
                <g transform={`translate(${this.padding},${this.padding})`}>
                    <rect x={this.barOffsetX} y="0"
                        width="20" height={this.innerSize}
                        strokeWidth="20"
                        fill={`url(#${this.props.type})`} />
                    <g ref={(selector) => { this.selector = selector; }}>
                        <rect x={this.barOffsetX - 10} y={this.innerSize * (1 - this.props.value / 100) - 25 / 2}
                            width="40" height="25"
                            strokeWidth="20"
                            fill={this.state.dragging ? `hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)` : "white"} />
                    </g>
                    <text
                        x="130"
                        y="180"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        {this.props.value}%
                    </text>
                    <text
                        className="label"
                        x="130"
                        y="210"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        {this.props.type}
                    </text>
                </g>
            </svg>

        );
    }

    componentDidMount() {
        // Event handling using Reactive JS
        let mouseDowns = Rx.Observable.fromEvent(this.selector, "mousedown");
        let mouseMoves = Rx.Observable.fromEvent(this.canvas, "mousemove");
        let mouseUps = Rx.Observable.fromEvent(this.canvas, "mouseup");
        let mouseLeaves = Rx.Observable.fromEvent(this.canvas, "mouseleave");

        let touchStarts = Rx.Observable.fromEvent(this.selector, "touchstart");
        let touchMoves = Rx.Observable.fromEvent(this.selector, "touchmove");
        let touchEnds = Rx.Observable.fromEvent(this.canvas, "touchend");

        let mouseDrags = mouseDowns.concatMap(clickEvent => {
            const yMouseShouldBe = (1 - this.props.value / 100) * this.innerSize;
            const yMouseIs = clickEvent.clientY;
            const yMouseDelta = yMouseIs - yMouseShouldBe;
            return mouseMoves.takeUntil(mouseUps.merge(mouseLeaves)).map(moveEvent => {
                const y = moveEvent.clientY - yMouseDelta;
                let percentage = (1 - y / this.innerSize) * 100;
                percentage = Math.min(percentage, 100);
                percentage = Math.max(percentage, 0);
                return parseInt(percentage);
            });
        });

        let touchDrags = touchStarts.concatMap(startEvent => {
            startEvent.preventDefault();
            const yTouchShouldBe = (1 - this.props.value / 100) * this.innerSize;
            const yTouchIs = startEvent.touches[0].clientY;
            const yTouchDelta = yTouchIs - yTouchShouldBe;
            return touchMoves.takeUntil(touchEnds).map(moveEvent => {
                moveEvent.preventDefault();
                const y = moveEvent.touches[0].clientY - yTouchDelta;
                let percentage = (1 - y / this.innerSize) * 100;
                percentage = Math.min(percentage, 100);
                percentage = Math.max(percentage, 0);
                return parseInt(percentage);
            });
        });

        let dragStarts = mouseDowns.merge(touchStarts);
        let drags = mouseDrags.merge(touchDrags);
        let dragEnds = mouseUps.merge(mouseLeaves).merge(touchEnds);

        dragStarts.forEach(() => {
            this.setState({ dragging: true });
        });

        drags.forEach(percentage => {
            this.props.set(percentage);
        });

        dragEnds.forEach(() => {
            this.setState({ dragging: false });
        });
    }
}

/*********
* REDUX
**********/

const initialState = {
    hue: 158,
    saturation: 100,
    lightness: 53,
    red: 15,
    green: 255,
    blue: 167,
    hex: "#0FFFA7"
};

const hsl2rgb = (hue, saturation, lightness) => {
    saturation /= 100;
    lightness /= 100;
    const C = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const X = C * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness - C / 2;
    let [R, G, B] =
        0 <= hue && hue < 60 && [C, X, 0] ||
        60 <= hue && hue < 120 && [X, C, 0] ||
        120 <= hue && hue < 180 && [0, C, X] ||
        180 <= hue && hue < 240 && [0, X, C] ||
        240 <= hue && hue < 300 && [X, 0, C] ||
        300 <= hue && hue < 360 && [C, 0, X];
    [R, G, B] = [(R + m) * 255, (G + m) * 255, (B + m) * 255];
    return [Math.round(R), Math.round(G), Math.round(B)];
};

const rgb2hex = (red, green, blue) => {
    red = red.toString(16).toUpperCase();
    green = green.toString(16).toUpperCase();
    blue = blue.toString(16).toUpperCase();
    red = red.length === 1 ? "0" + red : red;
    green = green.length === 1 ? "0" + green : green;
    blue = blue.length === 1 ? "0" + blue : blue;
    return `#${red}${green}${blue}`;
};

const mainReducer = (state = initialState, action) => {
    let red;
    let green;
    let blue;
    let hex;
    switch (action.type) {
        case 'HUE':
            [red, green, blue] = hsl2rgb(action.value, state.saturation, state.lightness);
            hex = rgb2hex(red, green, blue);
            return Object.assign({}, state, { hue: action.value, red, green, blue, hex });
        case 'SATURATION':
            [red, green, blue] = hsl2rgb(state.hue, action.value, state.lightness);
            hex = rgb2hex(red, green, blue);
            return Object.assign({}, state, { saturation: action.value, red, green, blue, hex });
        case 'LIGHTNESS':
            [red, green, blue] = hsl2rgb(state.hue, state.saturation, action.value);
            hex = rgb2hex(red, green, blue);
            return Object.assign({}, state, { lightness: action.value, red, green, blue, hex });
        default:
            return state;
    }
};

/* Import { createStore } from 'redux' */
const { createStore } = Redux;

const store = createStore(mainReducer);

/*********
* REACT-REDUX
**********/

const mapStateToProps = (state, ownProps) => {
    return {
        hue: state.hue,
        saturation: state.saturation,
        lightness: state.lightness,
        red: state.red,
        green: state.green,
        blue: state.blue,
        hex: state.hex
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setHue: (value) => {
            dispatch({
                type: 'HUE',
                value
            });
        },
        setSaturation: (value) => {
            dispatch({
                type: 'SATURATION',
                value
            });
        },
        setLightness: (value) => {
            dispatch({
                type: 'LIGHTNESS',
                value
            });
        }
    };
};

/* Import { connect, Provider } from 'react-redux' */
const { connect, Provider } = ReactRedux;

const ConnectedContainer = connect(mapStateToProps, mapDispatchToProps)(Container);

/*********
* REACT DOM + REDUX
**********/

ReactDOM.render(
    <Provider store={store}>
        <ConnectedContainer />
    </Provider>,
    document.getElementById('app')
);