import { SearchIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sort, STATUS_LABELS, Status } from "@/api/types"

const NONE = "all"

function FilterSelect({ value, onValueChange, options, className }) {
  return (
    <Select value={value || NONE} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([optValue, label]) => (
          <SelectItem key={optValue} value={optValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const STATUS_OPTIONS = [
  [NONE, "Any status"],
  ...[Status.UNDER_REVIEW, Status.PLANNED, Status.IN_PROGRESS, Status.RELEASED, Status.DECLINED, Status.REDIRECTED].map(
    (s) => [s, STATUS_LABELS[s]]
  ),
]

const SORT_OPTIONS = [
  [Sort.SUPPORT, "Most support"],
  [Sort.NEWEST, "Newest"],
]

const fromNone = (value) => (value === NONE ? "" : value)

export function RequestFilters({ params, onChange, onClear }) {
  const hasFilters = Boolean(params.q || params.status)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={params.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search feature requests…"
          className="pl-8"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={params.status}
          onValueChange={(status) => onChange({ status: fromNone(status) })}
          options={STATUS_OPTIONS}
          className="min-w-32"
        />
        <FilterSelect
          value={params.sort}
          onValueChange={(sort) => onChange({ sort })}
          options={SORT_OPTIONS}
          className="min-w-32"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <XIcon data-icon="inline-start" className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}