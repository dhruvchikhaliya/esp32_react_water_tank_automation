import { useTheme } from "@emotion/react";
import { Box, Button, Dialog, DialogActions, DialogTitle, FormControl, Input, InputLabel, Tab, Tabs, Theme, Typography, useMediaQuery } from "@mui/material";
import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { concatMap, fromEvent, map, merge, mergeMap, Observable, takeUntil } from 'rxjs';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface HslColorProps {
    hue: number;
    saturation: number;
    lightness: number;
    onChange: Function;
}

interface ColorPickerProps {
    hex: string;
    onChange: Function;
}

interface HueProps extends HslColorProps {
    setHue: Dispatch<SetStateAction<number>>;
    theme: any;
}

interface SaturationProps extends HslColorProps {
    setSaturation: Dispatch<SetStateAction<number>>;
    theme: any;
}

interface LightnessProps extends HslColorProps {
    setLightness: Dispatch<SetStateAction<number>>;
    theme: any;
}

interface PercentageProps extends HslColorProps {
    type: string;
    value: number;
    gradient: any;
    set: Dispatch<SetStateAction<number>>;
}

interface HueSlice {
    degree: number;
    color: string | undefined;
    radius: number;
    marker: boolean;
}
interface HSVMaskProps {
    onChange: (event: { target: { name: string; value: string; }; }) => void;
    name: string;
}
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ColorPicker: React.FC<ColorPickerProps> = ({ hex, onChange }) => {
    const theme = useTheme();
    const mobile = useMediaQuery('(min-width:1200px)');
    var hsl: number[] = hex2hsl(hex);
    const [h, setH] = useState<number>(hsl[0]);
    const [s, setS] = useState<number>(hsl[1]);
    const [l, setL] = useState<number>(hsl[2]);
    var rgb: number[] = hsl2rgb(h, s, l);
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function a11yProps(index: number) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }
    const handleOnChange = () => {
        if (typeof onChange === 'function') {
            onChange(rgb2hex(rgb[0], rgb[1], rgb[2]));
        }
    };

    return (
        < >
            {mobile ?
                <>
                    <div className="flex flex-wrap items-center justify-center w-full h-full">
                        <Hue hue={h} saturation={s} lightness={l} setHue={setH} theme={theme} onChange={handleOnChange} />
                        <Saturation hue={h} saturation={s} lightness={l} setSaturation={setS} theme={theme} onChange={handleOnChange} />
                        <Lightness hue={h} saturation={s} lightness={l} setLightness={setL} theme={theme} onChange={handleOnChange} />
                    </div>
                </> : <>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
                        <Tab label="Hue" {...a11yProps(0)} />
                        <Tab label="Saturation" {...a11yProps(1)} />
                        <Tab label="Lightness"  {...a11yProps(2)} />
                    </Tabs>
                    <TabPanel value={value} index={0}>
                        <div className="flex flex-wrap items-center justify-center w-full h-full">
                            <Hue hue={h} saturation={s} lightness={l} setHue={setH} theme={theme} onChange={handleOnChange} />
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <div className="flex flex-wrap items-center justify-center w-full h-full">
                            <Saturation hue={h} saturation={s} lightness={l} setSaturation={setS} theme={theme} onChange={handleOnChange} />
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <div className="flex flex-wrap items-center justify-center w-full h-full">
                            <Lightness hue={h} saturation={s} lightness={l} setLightness={setL} theme={theme} onChange={handleOnChange} />
                        </div>
                    </TabPanel>
                </>}
            <div className="d p-5 text-sm text-center">
                <div>
                    {`hsl(${h}, ${s}%, ${l}%)`}
                </div>
                <div>
                    {`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
                </div>
                <div>
                    {hex}
                </div>
            </div>
        </>
    );
};

export default ColorPicker;

class Hue extends React.Component<HueProps, { dragging: boolean; }> {
    private radius: number;
    private outterSize: number;
    private centerOffset: number;
    private canvas: SVGGElement | null = null;
    private selector: SVGGElement | null = null;
    constructor(prop: HueProps) {
        super(prop);
        this.state = {
            dragging: false
        };

        const padding = 60;
        const innerSize = 300;
        this.radius = innerSize / 2;
        this.outterSize = innerSize + padding;
        this.centerOffset = this.outterSize / 2;

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
                            color={this.state.dragging ? `hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)` : this.props.theme.palette.text.primary}
                            marker={true} />
                    </g>
                    <text
                        className="text-8xl stroke-4 select-none"
                        x="10"
                        y="30"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        {this.props.hue}°
                    </text>
                    <text
                        className="text-2xl stroke-0 select-none"
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
        // Event handling using Reactive JSdocument.querySelector(this.selector);
        let mouseDowns: Observable<MouseEvent> = fromEvent<MouseEvent>(this.selector!, "mousedown");
        let mouseMoves: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mousemove");
        let mouseUps: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mouseup");
        let mouseLeaves: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mouseleave");

        let touchStarts: Observable<TouchEvent> = fromEvent<TouchEvent>(this.selector!, "touchstart");
        let touchMoves: Observable<TouchEvent> = fromEvent<TouchEvent>(this.selector!, "touchmove");
        let touchEnds: Observable<TouchEvent> = fromEvent<TouchEvent>(this.canvas!, "touchend");

        let mouseDrags = mouseDowns.pipe(concatMap((clickEvent: MouseEvent) => {
            const xMouseShouldBe = Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yMouseShouldBe = -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xMouseIs = clickEvent.clientX;
            const yMouseIs = clickEvent.clientY;
            const xMouseDelta = xMouseIs - xMouseShouldBe;
            const yMouseDelta = yMouseIs - yMouseShouldBe;
            return mouseMoves.pipe(
                takeUntil(merge(mouseUps, mouseLeaves)),
                map((moveEvent: MouseEvent) => {
                    const xRelativeToCenter = moveEvent.clientX - xMouseDelta;
                    const yRelativeToCenter = moveEvent.clientY - yMouseDelta;
                    const degree =
                        (Math.atan(yRelativeToCenter / xRelativeToCenter) * 180) /
                        Math.PI +
                        90 +
                        (xRelativeToCenter >= 0 ? 0 : 180);
                    return Math.round(degree);
                })
            );
        }));

        let touchDrags = touchStarts.pipe(concatMap((startEvent: TouchEvent) => {
            startEvent.preventDefault();
            const xTouchShouldBe = Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yTouchShouldBe = -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xTouchIs = startEvent.touches[0].clientX;
            const yTouchIs = startEvent.touches[0].clientY;
            const xTouchDelta = xTouchIs - xTouchShouldBe;
            const yTouchDelta = yTouchIs - yTouchShouldBe;

            return touchMoves.pipe(
                takeUntil(touchEnds),
                map((moveEvent: TouchEvent) => {
                    moveEvent.preventDefault();
                    const xRelativeToCenter = moveEvent.touches[0].clientX - xTouchDelta;
                    const yRelativeToCenter = moveEvent.touches[0].clientY - yTouchDelta;
                    const degree =
                        (Math.atan(yRelativeToCenter / xRelativeToCenter) * 180) / Math.PI +
                        90 +
                        (xRelativeToCenter >= 0 ? 0 : 180);
                    return Math.round(degree);
                }));
        }));

        let dragStarts = merge(mouseDowns, touchStarts);
        let drags = merge(mouseDrags, touchDrags);
        let dragEnds = merge(mouseUps, mouseLeaves, touchEnds);

        dragStarts.subscribe(() => {
            this.setState({ dragging: true });
        });

        drags.subscribe(degree => {
            this.props.setHue(degree);
            this.props.onChange();
        });

        dragEnds.subscribe(() => {
            this.setState({ dragging: false });
        });
    }
}

const HueSlice = ({ degree, color, radius, marker }: HueSlice) => {
    const thickness = marker ? 5 : 1;
    const startX = Math.sin((degree - thickness) / 180 * Math.PI) * radius;
    const startY = - Math.cos((degree - thickness) / 180 * Math.PI) * radius;
    const endX = Math.sin((degree + thickness) / 180 * Math.PI) * radius;
    const endY = - Math.cos((degree + thickness) / 180 * Math.PI) * radius;
    return <path
        className={marker ? "stroke-40" : "stroke-20"}
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
        stroke={color} />;
};;

class Percentage extends React.Component<PercentageProps, { dragging: boolean; }> {
    private padding: number;
    private innerSize: number;
    private outterSize: number;
    private barOffsetX: number;
    private canvas: SVGGElement | null = null;
    private selector: SVGGElement | null = null;
    constructor(props: PercentageProps) {
        super(props);

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
                        className="text-8xl stroke-4 select-none"
                        x="130"
                        y="180"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${this.props.saturation}%, ${this.props.lightness}%)`}>
                        {this.props.value}%
                    </text>
                    <text
                        className="text-2xl stroke-0 select-none"
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
        let mouseDowns: Observable<MouseEvent> = fromEvent<MouseEvent>(this.selector!, "mousedown");
        let mouseMoves: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mousemove");
        let mouseUps: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mouseup");
        let mouseLeaves: Observable<MouseEvent> = fromEvent<MouseEvent>(this.canvas!, "mouseleave");

        let touchStarts: Observable<TouchEvent> = fromEvent<TouchEvent>(this.selector!, "touchstart");
        let touchMoves: Observable<TouchEvent> = fromEvent<TouchEvent>(this.selector!, "touchmove");
        let touchEnds: Observable<TouchEvent> = fromEvent<TouchEvent>(this.canvas!, "touchend");

        let mouseDrags = mouseDowns.pipe(concatMap((clickEvent: MouseEvent) => {
            const yMouseShouldBe = (1 - this.props.value / 100) * this.innerSize;
            const yMouseIs = clickEvent.clientY;
            const yMouseDelta = yMouseIs - yMouseShouldBe;
            return mouseMoves.pipe(
                takeUntil(merge(mouseUps, mouseLeaves)),
                map((moveEvent: MouseEvent) => {
                    const y = moveEvent.clientY - yMouseDelta;
                    let percentage = (1 - y / this.innerSize) * 100;
                    percentage = Math.min(percentage, 100);
                    percentage = Math.max(percentage, 0);
                    return Math.round(percentage);
                })
            );
        }));

        let touchDrags = touchStarts.pipe(concatMap((startEvent: TouchEvent) => {
            startEvent.preventDefault();
            const yTouchShouldBe = (1 - this.props.value / 100) * this.innerSize;
            const yTouchIs = startEvent.touches[0].clientY;
            const yTouchDelta = yTouchIs - yTouchShouldBe;
            return touchMoves.pipe(
                takeUntil(touchEnds),
                map((moveEvent: TouchEvent) => {
                    moveEvent.preventDefault();
                    const y = moveEvent.touches[0].clientY - yTouchDelta;
                    let percentage = (1 - y / this.innerSize) * 100;
                    percentage = Math.min(percentage, 100);
                    percentage = Math.max(percentage, 0);
                    return Math.round(percentage);
                })
            );
        }));

        let dragStarts = merge(mouseDowns, touchStarts);
        let drags = merge(mouseDrags, touchDrags);
        let dragEnds = merge(mouseUps, mouseLeaves, touchEnds);

        dragStarts.forEach(() => {
            this.setState({ dragging: true });
        });

        drags.subscribe(percentage => {
            this.props.set(percentage);
            this.props.onChange();
        });

        dragEnds.forEach(() => {
            this.setState({ dragging: false });
        });
    }
}
const Saturation: React.FC<SaturationProps> = ({ hue, saturation, lightness, setSaturation, onChange }) => {
    const gradient = <linearGradient id="Saturation" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={`hsl(${hue}, 100%, ${lightness}%)`} />
        <stop offset="100%" stopColor={`hsl(${hue}, 0%, ${lightness}%)`} />
    </linearGradient>;
    return <Percentage
        type="Saturation" value={saturation} gradient={gradient}
        hue={hue} saturation={saturation} lightness={lightness}
        set={setSaturation} onChange={onChange} />;
};

const Lightness: React.FC<LightnessProps> = ({ hue, saturation, lightness, setLightness, onChange }) => {
    const gradient = <linearGradient id="Lightness" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={`hsl(${hue}, ${saturation}%, 100%)`} />
        <stop offset="50%" stopColor={`hsl(${hue}, ${saturation}%, 50%)`} />
        <stop offset="100%" stopColor={`hsl(${hue}, ${saturation}%, 0%)`} />
    </linearGradient>;
    return <Percentage
        type="Lightness" value={lightness} gradient={gradient}
        hue={hue} saturation={saturation} lightness={lightness}
        set={setLightness} onChange={onChange} />;
};

const hsl2rgb = (hue: number, saturation: number, lightness: number): number[] => {
    saturation /= 100;
    lightness /= 100;
    const C = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const X = C * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness - C / 2;
    let R, G, B;
    if (hue >= 0 && hue < 60) {
        [R, G, B] = [C, X, 0];
    } else if (hue >= 60 && hue < 120) {
        [R, G, B] = [X, C, 0];
    } else if (hue >= 120 && hue < 180) {
        [R, G, B] = [0, C, X];
    } else if (hue >= 180 && hue < 240) {
        [R, G, B] = [0, X, C];
    } else if (hue >= 240 && hue < 300) {
        [R, G, B] = [X, 0, C];
    } else {
        [R, G, B] = [C, 0, X];
    }
    R = Math.round((R + m) * 255);
    G = Math.round((G + m) * 255);
    B = Math.round((B + m) * 255);
    return [R, G, B];
};

const rgb2hex = (red: number, green: number, blue: number): string => {
    var r: string = red.toString(16).toUpperCase();
    var g: string = green.toString(16).toUpperCase();
    var b: string = blue.toString(16).toUpperCase();
    r = r.length === 1 ? "0" + r : r;
    g = g.length === 1 ? "0" + g : g;
    b = b.length === 1 ? "0" + b : b;
    return `#${r}${g}${b}`;
};

const hex2hsl = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex string: ${hex}`);
    }
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return [h, s, l];
};