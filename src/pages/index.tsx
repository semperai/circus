import { useState } from 'react';
import { Fragment } from 'react'
import Head from 'next/head'
import { Menu, Listbox, Popover, Transition } from '@headlessui/react'
import { Tooltip, RangeSlider } from 'flowbite-react';
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

import Editor from '../components/Editor';
import RangeSliderTextbox from '../components/RangeSliderTextbox';


const inter = Inter({ subsets: ['latin'] })

const models = [
  { id: 'llama-7', name: 'text-llama-7' },
]

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Home', href: '#', current: true },
  { name: 'Profile', href: '#', current: false },
  { name: 'Resources', href: '#', current: false },
  { name: 'Company Directory', href: '#', current: false },
  { name: 'Openings', href: '#', current: false },
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Home() {
  const [value, setValue] = useState();
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [temperature, setTemperature] = useState(0.8);
  const [maximumLength, setMaximumLength] = useState(256);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [bestOf, setBestOf] = useState(1);
  const [startText, setStartText] = useState('');
  const [restartText, setRestartText] = useState('');


  return (
    <>
      <div className="min-h-full">
        <Popover as="header" className="bg-indigo-600 pb-24">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="relative flex items-center justify-center py-5 lg:justify-between">
                  {/* Logo */}
                  <div className="absolute left-0 flex-shrink-0 lg:static">
                    <a href="#">
                      <span className="sr-only">Your Company</span>
                      <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=300"
                        alt="Your Company"
                      />
                    </a>
                  </div>

                  {/* Right section on desktop */}
                  <div className="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5">
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-full p-1 text-indigo-200 hover:bg-white hover:bg-opacity-10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm ring-2 ring-white ring-opacity-20 focus:outline-none focus:ring-opacity-100">
                          <span className="sr-only">Open user menu</span>
                          <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute -right-2 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>

                  {/* Search */}
                  <div className="min-w-0 flex-1 px-12 lg:hidden">
                    <div className="mx-auto w-full max-w-xs">
                      <label htmlFor="desktop-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative text-white focus-within:text-gray-600">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                          id="desktop-search"
                          className="block w-full rounded-md border-0 bg-white/20 py-1.5 pl-10 pr-3 text-white placeholder:text-white focus:bg-white focus:text-gray-900 focus:ring-0 focus:placeholder:text-gray-500 sm:text-sm sm:leading-6"
                          placeholder="Search"
                          type="search"
                          name="search"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Menu button */}
                  <div className="absolute right-0 flex-shrink-0 lg:hidden">
                    {/* Mobile menu button */}
                    <Popover.Button className="inline-flex items-center justify-center rounded-md bg-transparent p-2 text-indigo-200 hover:bg-white hover:bg-opacity-10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Popover.Button>
                  </div>
                </div>
              </div>

              <Transition.Root as={Fragment}>
                <div className="lg:hidden">
                  <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Overlay className="fixed inset-0 z-20 bg-black bg-opacity-25" />
                  </Transition.Child>

                  <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="duration-150 ease-in"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Popover.Panel
                      focus
                      className="absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-3xl origin-top transform p-2 transition"
                    >
                      <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="pt-3 pb-2">
                          <div className="flex items-center justify-between px-4">
                            <div>
                              <img
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                alt="Your Company"
                              />
                            </div>
                            <div className="-mr-2">
                              <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </Popover.Button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1 px-2">
                            <a
                              href="#"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                            >
                              Home
                            </a>
                            <a
                              href="#"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                            >
                              Profile
                            </a>
                            <a
                              href="#"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                            >
                              Resources
                            </a>
                            <a
                              href="#"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                            >
                              Company Directory
                            </a>
                            <a
                              href="#"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                            >
                              Openings
                            </a>
                          </div>
                        </div>
                        <div className="pt-4 pb-2">
                          <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="truncate text-base font-medium text-gray-800">{user.name}</div>
                              <div className="truncate text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                            <button
                              type="button"
                              className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              <span className="sr-only">View notifications</span>
                              <BellIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="mt-3 space-y-1 px-2">
                            {userNavigation.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                              >
                                {item.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition.Child>
                </div>
              </Transition.Root>
            </>
          )}
        </Popover>
        <main className="-mt-24 pb-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <h1 className="sr-only">Page title</h1>
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8 h-screen">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <h2 className="sr-only" id="section-1-title">
                    Section title
                  </h2>
                  <div className="overflow-hidden rounded-lg bg-white shadow h-screen">
                    <div className="p-6 h-screen">
                       <Editor
                          placeholder="Type some code…"
                          value={value}
                          onValueChange={(code) => setValue(code)}
                          highlight={(code) => /* highlight(code, languages.jsx!, 'jsx')*/ code}
                          padding={0}
                          className="container__editor h-screen"
                        />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right column */}
              <div className="grid grid-cols-1 gap-4">
                <section aria-labelledby="section-2-title">
                  <h2 className="sr-only" id="section-2-title">
                    Section title
                  </h2>
                  <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-6">
                      <form className="space-y-8 divide-y divide-gray-200">
                        <div className="space-y-8 divide-y divide-gray-200">
                          <div>
                            <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-6">
								<Tooltip content="Tooltip content" style="light" placement="left">
                                  <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
                                    Model
                                  </label>
                                </Tooltip>
                                <div className="mt-2">
 							      <Listbox value={selectedModel} onChange={setSelectedModel}>
							        {({ open }) => (
							          <>
							            <div className="relative mt-2">
							          	<Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
							          	  <span className="block truncate">{selectedModel.name}</span>
							          	  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							          		<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							          	  </span>
							          	</Listbox.Button>

							          	<Transition
							          	  show={open}
							          	  as={Fragment}
							          	  leave="transition ease-in duration-100"
							          	  leaveFrom="opacity-100"
							          	  leaveTo="opacity-0"
							          	>
							          	  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							          		{models.map((model) => (
							          		  <Listbox.Option
							          			key={model.id}
							          			className={({ active }) =>
							          			  classNames(
							          				active ? 'bg-indigo-600 text-white' : 'text-gray-900',
							          				'relative cursor-default select-none py-2 pl-3 pr-9'
							          			  )
							          			}
							          			value={model}
							          		  >
							          			{({ selected, active }) => (
							          			  <>
							          				<span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
							          				  {model.name}
							          				</span>

							          				{selected ? (
							          				  <span
							          					className={classNames(
							          					  active ? 'text-white' : 'text-indigo-600',
							          					  'absolute inset-y-0 right-0 flex items-center pr-4'
							          					)}
							          				  >
							          					<CheckIcon className="h-5 w-5" aria-hidden="true" />
							          				  </span>
							          				) : null}
							          			  </>
							          			)}
							          		  </Listbox.Option>
							          		))}
							          	  </Listbox.Options>
							          	</Transition>
							            </div>
							          </>
							        )}
							      </Listbox>
								</div>
                              </div>
                      
                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Temperature"
                                  tooltip="Maximum amount of tokens"
                                  min={0.0}
                                  max={1.0}
                                  step={0.01}
                                  value={temperature}
                                  onChange={(e) => setTemperature(e.target.value)}
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Maximum Length"
                                  tooltip="Maximum amount of tokens"
                                  min={0}
                                  max={2048}
                                  step={1}
                                  value={maximumLength}
                                  onChange={(e) => setMaximumLength(e.target.value)}
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Top P"
                                  tooltip="Control diversity"
                                  min={0.0}
                                  max={1.0}
                                  step={0.01}
                                  value={topP}
                                  onChange={(e) => setTopP(e.target.value)}
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Frequency Penalty"
                                  tooltip=""
                                  min={0.0}
                                  max={2.0}
                                  step={0.01}
                                  value={frequencyPenalty}
                                  onChange={(e) => setFrequencyPenalty(e.target.value)}
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Presence Penalty"
                                  tooltip=""
                                  min={0.0}
                                  max={2.0}
                                  step={0.01}
                                  value={presencePenalty}
                                  onChange={(e) => setPresencePenalty(e.target.value)}
                                />
                              </div>

                              <div className="sm:col-span-6">
                                <RangeSliderTextbox
                                  label="Best of"
                                  tooltip=""
                                  min={0}
                                  max={20}
                                  step={1}
                                  value={bestOf}
                                  onChange={(e) => setBestOf(e.target.value)}
                                />
                              </div>

                              {/* TODO start text */ }
                              {/* TODO restart text */ }
                              {/* TODO show probabilities */ }
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
        <footer>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 sm:text-left">
              <span className="block sm:inline">&copy; 2021 Your Company, Inc.</span>{' '}
              <span className="block sm:inline">All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

