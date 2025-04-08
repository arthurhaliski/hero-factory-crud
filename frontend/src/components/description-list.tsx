import clsx from 'clsx'

export function DescriptionList({ className, ...props }: React.ComponentPropsWithoutRef<'dl'>) {
  return (
    <dl
      {...props}
      className={clsx(
        className,
        'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6'
      )}
    />
  )
}

export function DescriptionTerm({ className, ...props }: React.ComponentPropsWithoutRef<'dt'>) {
  return (
    <dt
      {...props}
      className={clsx(className, 'col-start-1 text-zinc-500 dark:text-zinc-400')}
    />
  )
}

export function DescriptionDetails({ className, ...props }: React.ComponentPropsWithoutRef<'dd'>) {
  return (
    <dd
      {...props}
      className={clsx(className, 'text-zinc-950 dark:text-white')}
    />
  )
}
