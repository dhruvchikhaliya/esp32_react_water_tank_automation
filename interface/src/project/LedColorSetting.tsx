import { FC, useState, useContext } from "react";
import { LedColors } from "../types";
import { useRest } from "../utils";
import * as PumpApi from "../api/pump";
import { Button, Card, CardContent, Typography, Dialog, useMediaQuery, DialogActions, DialogTitle } from "@mui/material";
import { FormLoader } from "../components";
import SaveIcon from '@mui/icons-material/Save';
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { AuthenticatedContext } from '../contexts/authentication';

var idx = 0;
const LedColorSetting: FC = () => {
    const isMobile = useMediaQuery('(min-width:600px)');
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
        // var tmp = { colors: [132, 1, 132, 1, 1432] };
        tmp.colors[idx] = Number(clr.replace('#', '0x'));
        setData(tmp);
        setColorPicker(false);
    };

    const openColorPicker = (i: number) => {
        idx = i;
        setClr(`#${data.colors?.[idx].toString(16)}`);
        setColorPicker(true);
    };

    const validateAndSave = async () => {
        if (!authenticatedContext.me.admin) {
            enqueueSnackbar("Please login as admin", { variant: "warning" });
            return;
        }
        await saveData();
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-5">
                {['Ideal', 'Pump Run', 'Auto Start', 'Wire Fault', 'Sensor Fault', 'Relay Fault'].map((val: string, i: number) => {
                    return (
                        <><Card variant="outlined" sx={{ borderRadius: 5, display: 'inline-block', width: 170, margin: 2, textAlign: "center", paddingBottom: 1 }} >
                            <CardContent sx={{ textAlign: "center", justifyContent: "center", display: "inline-block", paddingBottom: 0 }}>
                                <div className="w-20 h-20 rounded-full border-2"
                                    style={{ backgroundColor: `#${data.colors?.[i].toString(16)}`, textAlign: "center", display: "block" }}
                                    onClick={() => openColorPicker(i)}></div>
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
                    disabled={saving}
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={validateAndSave}
                >Save</Button>
            </div>


            <Dialog
                open={colorPicker}
                onClose={handleClose}>
                <DialogTitle>Pick a color</DialogTitle>
                <ChromePicker
                    disableAlpha={true}
                    styles={{
                        default: {
                            picker: {
                                boxShadow: 'none',
                                width: 500
                            },
                        }
                    }}
                    color={clr}
                    onChange={(color) => { setClr(color.hex); }}
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
