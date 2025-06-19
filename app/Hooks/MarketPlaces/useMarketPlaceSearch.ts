import { useEffect, useState } from "react"
import { getUnassignJob } from "../../ApiController/ApiController";
import { translationString } from '../../Assets/translation/Translation';
import { Job } from "../../Model/Job";
import { JobDataArray } from "../../Model/JobDataArray";
import { useMarketPlaceProvider } from "../../Provider/MarketPlaceProvider";

export const useMarketPlaceSearch = () => {
    const TAKE = 15
    let timer: NodeJS.Timeout
    const [isHasMore, setHasMore] = useState(true)
    const [isRefresh, setRefresh] = useState(false)
    const [isShowFooter, setShowFooter] = useState<boolean>(false)
    const [searchText, setSearchText] = useState('')
    const marketProvider = useMarketPlaceProvider()
    const [list, setList] = useState<Array<Job>>([])

    const onRefresh = () => {
        setRefresh(true)
    }

    const onLoadMore = () => {
        if (isHasMore) {
            setShowFooter(true)
        }
    }

    useEffect(() => {
        if (!isRefresh && isHasMore) {
            getList()
        }
    }, [isShowFooter])

    useEffect(() => {
        if (isRefresh) {
            getList()
        }
    }, [isRefresh])

    const getList = async () => {
        if (searchText != "") {
            getUnassignJob(isRefresh ? 0 : list.length, TAKE, searchText).then((value) => {
                const data = value.data as JobDataArray
                let newList = data.dataArray
                const selectedList = marketProvider.selectedJobList
                newList.forEach((value) => {
                    const found = selectedList.find(selected => selected.id == value.id)
                    if (found != null) {
                        value.isSelected = true
                    }
                })
                setHasMore(newList.length >= TAKE)
                if (isRefresh) {
                    setList([])
                    setList(newList)
                } else {
                    setList([...list, ...newList])
                }
                setShowFooter(false)
                setRefresh(false)
            }).catch((e: any) => {
                console.log(e)
                setRefresh(false)
                setShowFooter(false)
                // set error message
            })
        } else {
            setList([])
            setRefresh(false)
            setShowFooter(false)
        }
    }

    useEffect(() => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            setRefresh(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [searchText])

    const addSelected = (job: Job) => {
        if (!marketProvider.selectedJobList.find(found => found.id == job.id)) {
            marketProvider.onSelected(job)
        }
    }

    const removeSelected = (job: Job) => {
        marketProvider.onRemove(job);
    }

    const getSelectedCount = () => {
        return translationString.formatString(
            translationString.see_full_list,
            marketProvider.selectedJobList.length
        ) as string
    }

    return {
        list,
        isRefresh,
        onRefresh,
        onLoadMore,
        isShowFooter,
        addSelected,
        removeSelected,
        setSearchText,
        getSelectedCount,
        searchText
    }
}