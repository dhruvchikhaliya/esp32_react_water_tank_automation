import { FC, useState, useContext } from "react";
import { LedColors } from "../types";
import { useRest } from "../utils";
import * as PumpApi from "../api/pump";
import { Button, Card, CardContent, Typography, Dialog, useMediaQuery, DialogActions, DialogTitle } from "@mui/material";
import { FormLoader } from "../components";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { AuthenticatedContext } from '../contexts/authentication';
import ColorPicker from "./ColorPicker";

var idx = 0;
const LedColorSetting: FC = () => {
    const [colorPicker, setColorPicker] = useState<boolean>(false);
    const [clr, setClr] = useState<string>("");
    const { enqueueSnackbar } = useSnackbar();
    const authenticatedContext = useContext(AuthenticatedContext);

    const {
        loadData, saving, data, setData, saveData, errorMessage
    } = useRest<LedColors>({ read: PumpApi.readColorSetting, update: PumpApi.updateColorSetting });

    if (!data || !data?.hasOwnProperty('colors') || (data?.colors.length != 6)) {
        return (<FormLoader />);
    }

    const handleClose = () => {
        setColorPicker(false);
    };

    const handleSave = () => {
        var tmp = { ...data };
        tmp.colors[idx] = Number(clr.replace('#', '0x'));
        setData(tmp);
        setColorPicker(false);
    };

    const openColorPicker = (i: number) => {
        idx = i;
        setClr(getColorHex(data.colors?.[idx]));
        setColorPicker(true);
    };

    const validateAndSave = async () => {
        if (!authenticatedContext.me.admin) {
            enqueueSnackbar("Please login as admin", { variant: "warning" });
            return;
        }
        await saveData();
    };

    const getColorHex = (color: number): string => {
        return `#${('000000' + (color).toString(16)).substr(-6)}`;
    };
    return (
        <>
            {/* <div className="grid grid-cols-1 md:grid-cols-5"> */}
            <div className="flex flex-wrap items-center justify-center w-full h-full">
                    {['Ideal', 'Pump Run', 'Auto Start', 'Wire Fault', 'Sensor Fault', 'Relay Fault'].map((val: string, i: number) => {
                        var color = getColorHex(data.colors?.[i]);
                        return (
                            <><Card variant="outlined" sx={{ borderRadius: 5, display: 'inline-block', width: 150, margin: 2, textAlign: "center", paddingBottom: 1 }} >
                                <CardContent sx={{ textAlign: "center", justifyContent: "center", display: "inline-block", paddingBottom: 0 }}>
                                    <div className="w-20 h-20 rounded-full border-2"
                                        style={{ backgroundColor: color, textAlign: "center", display: "block" }}
                                        onClick={() => openColorPicker(i)}></div>
                                    <Typography variant="subtitle1">
                                        {color}
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
                    disabled={saving}
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={validateAndSave}
                >Save</Button>
            </div>

            <Dialog
                open={colorPicker}
                onClose={handleClose}
                maxWidth={'xl'}>

                <DialogTitle>Pick a color</DialogTitle>
                <ColorPicker hex={clr} onChange={(hex: string) => { setClr(hex); }} />
                <DialogActions>
                    <Button startIcon={<CloseIcon />} variant="contained" onClick={handleClose} color="primary">Close</Button>
                    <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

        </>
    );

};
export default LedColorSetting;
