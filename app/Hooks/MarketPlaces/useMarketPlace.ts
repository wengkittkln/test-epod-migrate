import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react"
import { getUnassignJob } from "../../ApiController/ApiController";
import { ImageRes } from "../../Assets";
import { translationString } from "../../Assets/translation/Translation";
import { Job } from "../../Model/Job";
import { JobDataArray } from "../../Model/JobDataArray";
import { MarketPlacesParamsList } from "../../NavigationStacks/MarketPlaceStack";
import { useMarketPlaceProvider } from "../../Provider/MarketPlaceProvider";

export const useMarketPlace = (navigation: StackNavigationProp<MarketPlacesParamsList, "MarketPlace">) => {
    const TAKE = 15
    const [isLoading, setLoading] = useState(false)
    const [isHasMore, setHasMore] = useState(true)
    const [isRefresh, setRefresh] = useState(true)
    const [isShowFooter, setShowFooter] = useState<boolean>(false)
    const [isShowQuitDialog, setShowQuitDialog] = useState(false)
    const marketProvider = useMarketPlaceProvider()
    const [list, setList] = useState<Array<Job>>([])
    const [isShowError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    let timer;

    const onRefresh = () => {
        setRefresh(true)
    }

    const onLoadMore = () => {
        if (isHasMore) {
            setShowFooter(true)
        }
    }

    useEffect(() => {
        if (!isRefresh && isHasMore && isShowFooter) {
            getList()
        }
    }, [isShowFooter])

    useEffect(() => {
        if (isRefresh) {
            getList()
        }
    }, [isRefresh])

    const getList = async () => {

        // setList((JSON.parse(JSON.stringify(ImageRes.customData)) as JobDataArray).dataArray)
        // setRefresh(false)
        // setHasMore(false)

        getUnassignJob(isRefresh ? 0 : list.length, TAKE).then((value) => {
            const data = value.data as JobDataArray
            let newList = data.dataArray
            const selectedList = marketProvider.selectedJobList
            const tempList: any = list;
            newList.forEach(value => {
                if (!list.some(job => job.id === value.id)) {
                    tempList.push(value);
                }
            
                if (selectedList.some(selected => selected.id === value.id)) {
                    value.isSelected = true;
                }
            });
            
            setHasMore(newList.length >= TAKE)
            if (isRefresh) {
                setList(newList)
            } else {
                setList(tempList)
            }
            setShowFooter(false)
            setRefresh(false)
        }).catch((e: any) => {
            setRefresh(false)
            setShowFooter(false)
            setShowError(true)
            setErrorMessage(e.message)
            // set error message
        })
    }

    const addSelected = (job: Job) => {
        if (!marketProvider.selectedJobList.find(found => found.id == job.id)) {
            marketProvider.onSelected(job)
        }
    }

    const removeSelected = (job: Job) => {
        marketProvider.onRemove(job)
    }

    useEffect(() => {
        return navigation.addListener('focus', async () => {
            if (list.length > 0) {
                setLoading(true)
                const selectedList = marketProvider.selectedJobList

                list.forEach((value) => {
                    const found = selectedList.find(selected => selected.id == value.id)
                    value.isSelected = found != null
                })
                setList(list)
            }
        })
    }, [navigation, list, marketProvider.selectedJobList]);

    const getSelectedCount = () => {
        return translationString.formatString(
            translationString.see_full_list,
            marketProvider.selectedJobList.length
        ) as string
    }

    return {
        isLoading,
        list,
        isRefresh,
        onRefresh,
        onLoadMore,
        isShowFooter,
        addSelected,
        removeSelected,
        getSelectedCount,
        isShowQuitDialog,
        setShowQuitDialog,
        setLoading,
        isShowError,
        errorMessage,
        setShowError
    }
}