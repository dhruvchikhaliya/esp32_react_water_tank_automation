import { FC } from "react";
import { StopPoints } from "../types";
import { useRest } from "../utils";
import * as PumpApi from "../api/pump";
import { Slider, Button } from "@mui/material";
import { FormLoader } from "../components";
import SaveIcon from '@mui/icons-material/Save';

function valuetext(value: number) {
    return `${value}°C`;
}

const marks = Array.from({ length: 11 }, (_, i) => ({
    value: (i * 10),
    label: `${i * 200}L`,
}));

const StartStopPointSettings: FC = () => {
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
    return (
        <><div className='flex justify-center'>
            <Slider
                sx={{ height: 500, width: 200 }}
                getAriaLabel={() => 'StopStartSetting'}
                getAriaValueText={valuetext}
                // defaultValue={[data.start, data.stop]}
                value={[data.start, data.stop]}
                onChange={handleChanges}
                valueLabelDisplay="off"
                marks={marks}
                step={null}
                orientation="vertical"
            />
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
            </div></>
    );

};
export default StartStopPointSettings;