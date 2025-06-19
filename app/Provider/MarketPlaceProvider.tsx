import React, { FC, useState } from "react"
import { useContext, createContext } from "react"
import { Job } from "../Model/Job"

export type JobContextData = {
    onSelected(job: Job): void
    onAdd(jobs: Job[]): void
    onRemove(job: Job): void
    selectedJobList: Job[]
    updateList(jobs: Job[]): void,
    resetSelectedJobList():void
}

export const MarketPlaceJobContext = createContext<JobContextData | undefined>(undefined)
export const MarketPlaceProvider: FC = ({ children }) => {
    const [selectedJobList, setSelectedJobList] = useState([])

    const resetSelectedJobList = () =>{
        setSelectedJobList([]);
    }

    const onSelected = (job: Job) => {
        setSelectedJobList(oldList => [...oldList, job])
    }

    const onRemove = (job: Job) => {
        setSelectedJobList(oldList => oldList.filter(item => item.id !== job.id))
    }

    const updateList = (jobs: Job[]) => {
        setSelectedJobList(jobs)
    }

    const onAdd = (jobs: Job[]) => {
        selectedJobList.forEach((value) => {
            jobs = jobs.filter(item => item.id !== value.id)
        })
        setSelectedJobList([...selectedJobList, ...jobs])
    }
    return (
        <MarketPlaceJobContext.Provider value={{ onSelected, onRemove, selectedJobList, updateList, onAdd, resetSelectedJobList }}>
            {children}
        </MarketPlaceJobContext.Provider>
    )
}

export const useMarketPlaceProvider = () => {
    const context = useContext(MarketPlaceJobContext)
    if (!context) {
        throw new Error('useMarketPlaceProvider must be used within an MarketPlaceProvider');
    }
    return context
}