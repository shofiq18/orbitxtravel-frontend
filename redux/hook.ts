

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";


// typed hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
