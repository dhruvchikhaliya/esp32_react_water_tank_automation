import { FC, useState } from "react";
import { LedColors } from "../types";
import { useRest } from "../utils";
import * as PumpApi from "../api/pump";
import { Slider, Button, Card, CardContent, Typography, Stack, Dialog, useMediaQuery, DialogActions, DialogTitle } from "@mui/material";
import { FormLoader } from "../components";
import SaveIcon from '@mui/icons-material/Save';
import { set } from "lodash";
import Chrome from "react-color/lib/components/chrome/Chrome";
import { bgcolor, height } from "@mui/system";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import CloseIcon from '@mui/icons-material/Close';

var finalColor = "";
var idx = 0;
const LedColorSetting: FC = () => {
    const isMobile = useMediaQuery('(min-width:600px)');
    const [colorPicker, setColorPicker] = useState<boolean>(false);
    const [color, setColor] = useState<string>("");

    const {
        loadData, saving, data, setData, saveData, errorMessage
    } = useRest<LedColors>({ read: PumpApi.readColorSetting, update: PumpApi.updateColorSetting });

    if (!data) {//|| !data?.hasOwnProperty('colors')|| (data?.colors.length != 5)
        return (<FormLoader />);
    }

    const handleClose = () => {
        setColorPicker(false);
    };

    const handleSave = () => {
        // var tmp = { ...data };
        var tmp = { colors: [1, 1, 1, 1, 1] };
        tmp.colors[idx] = Number(finalColor.replace('#', '0x'));
        setData(tmp);
        setColorPicker(false);
    };

    const openColorPicker = (i: number) => {
        idx = i;
        setColor(`#${data.colors?.[idx].toString(16)}`);
        setColorPicker(true);
    };

    const validateAndSave = async () => {
        await saveData();
    };
    const style = {
        default: {
            picker: {
                width: 500
            },
            swatch: {
                width: 122
            }
        }
    };
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-5">
                {['Ideal', 'Pump Run', 'Interface Open', 'Sensor Fault', 'Relay Fault'].map((val: string, i: number) => {
                    return (
                        <><Card variant="outlined" sx={{ borderRadius: 5, display: 'inline-block', width: 170, margin: 2, textAlign: "center", paddingBottom: 1 }} >
                            <CardContent sx={{ textAlign: "center", justifyContent: "center", display: "inline-block", paddingBottom: 0 }}>
                                <div className="w-20 h-20 rounded-full border-2" onClick={() => openColorPicker(i)}
                                    style={{ backgroundColor: `#${data.colors?.[i].toString(16)}`, textAlign: "center", display: "block" }}>
                                </div>
                                <Typography variant="subtitle1">
                                    {`#${data.colors?.[i].toString(16)}`}
                                </Typography>
                            </CardContent>
                            <Typography variant="h6">
                                {val}
                            </Typography>
                        </Card>
                        </>);
                })
                }

            </div>
            <div className='w-full text-right'>
                <Button sx={{ margin: 1.5 }}
                    startIcon={<SaveIcon />}
                    // disabled={saving || noAdminConfigured()}
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={async () => { await saveData(); }}
                >Save</Button>
            </div>


            <Dialog
                open={colorPicker}
                onClose={handleClose}>
                <DialogTitle>Pick a color</DialogTitle>
                <ChromePicker
                    disableAlpha={true}
                    styles={style}
                    color={color}
                    onChange={(color) => { setColor(color.hex); }}
                    onChangeComplete={(color) => { finalColor = color.hex; }}
                />
                <DialogActions>
                    <Button startIcon={<CloseIcon />} variant="contained" onClick={handleClose} color="primary">Close</Button>
                    <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

        </>
    );

};
export default LedColorSetting;