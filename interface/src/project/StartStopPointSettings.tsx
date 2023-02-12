import { FC, useContext } from "react";
import { StopPoints } from "../types";
import { useRest } from "../utils";
import * as PumpApi from "../api/pump";
import { Slider, Button } from "@mui/material";
import { FormLoader } from "../components";
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { AuthenticatedContext } from '../contexts/authentication';

const marks = Array.from({ length: 11 }, (_, i) => ({
    value: (i * 200),
    label: `${i * 200}L`,
}));

const StartStopPointSettings: FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const authenticatedContext = useContext(AuthenticatedContext);
    const {
        loadData, saving, data, setData, saveData, errorMessage
    } = useRest<StopPoints>({ read: PumpApi.readStartStopPoint, update: PumpApi.updateStartStopPoint });

    if (!data || !data?.hasOwnProperty('start') || !data?.hasOwnProperty('stop')) {
        return (<FormLoader />);
    }

    const handleChanges = (
        event: Event,
        newValue: number | number[],
        activeThumb: number,
    ) => {
        if (!Array.isArray(newValue)) {
            return;
        }
        setData({ start: newValue[0], stop: newValue[1] });
    };

    const validateAndSave = async () => {
        if (!authenticatedContext.me.admin) {
            enqueueSnackbar("Please login as admin", { variant: "warning" });
            return;
        }
        await saveData();
    };

    return (
        <><div className='flex justify-center'>
            <Slider
                sx={{ height: 500, width: 200 }}
                getAriaLabel={() => 'StopStartSetting'}
                valueLabelDisplay="auto"
                value={[data.start, data.stop]}
                onChange={handleChanges}
                marks={marks}
                step={10}
                min={0}
                max={2000}
                orientation="vertical"
            />
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
            </div></>
    );

};
export default StartStopPointSettings;