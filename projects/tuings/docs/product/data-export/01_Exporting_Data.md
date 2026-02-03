# Exporting Your Data

Here’s how export your data from Things 3 on Mac and iOS.



###### In this article:

1. [Get the Things 3 database file](https://culturedcode.com/things/support/articles/2982272/#gqevu)
2. [Print to PDF (Mac-only)](https://culturedcode.com/things/support/articles/2982272/#oiwri)
3. [Access data through Apple Shortcuts](https://culturedcode.com/things/support/articles/2982272/#ppref)
4. [Access data through AppleScript (Mac-only)](https://culturedcode.com/things/support/articles/2982272/#jeeye)

### Get the Things 3 database file

In accordance with GDPR, you can access your data in the form of an industry-standard SQLite database file, which includes every piece of information about your to-dos. This format is machine-readable, not human-readable. To learn more about SQLite, check out [the official SQLite website](https://www.sqlite.org/).

Here’s how to get the database file (Things 3.13.1 or later):

1. On your Mac, quit Things 3. The app must not be running before you proceed.
2. In your Dock, click **Finder**.
3. In the menu bar at the top of your screen, click **Go** → **Go to Folder**.
4. Paste the following path into the sheet that appears: `~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/`
5. Hit the Return key.
6. Open the folder `ThingsData-xxxxx`. 
7. Copy – don’t move! – the bundle `Things Database.thingsdatabase` to where you’d like to keep it.

The actual database is contained within the `Things Database.thingsdatabase`bundle. To access it, CTRL + click on the bundle and select **Show Package Contents**. The file called `main.sqlite` contains your data.

If you’re using Things 3.13 or older, the file you’re getting is called `Things.sqlite3` and it can be viewed in a separate app as explained below.

To view the data in the `SQLite` file you need a viewer application. One we like to use ourselves is [Base 2](https://menial.co.uk/base/). It has a free trial available, and of course there are other applications out there which are free of charge.

### Print to PDF (Mac only)

If you’re looking for a non-technical solution to get your data out of Things 3, the easiest path forward would be to simply print all of your lists to PDF. You will be able to search the PDF for keywords, as well as select text inside of the PDF files to copy and paste into other apps.

1. On your Mac, open Things 3.
2. In the menu bar at the top of your screen, click **File** → **Print**.
3. Set **Scope** to **Entire List**.
4. Set **Notes** to **Full**.
5. Click **Print**.
6. A new window will open. At the bottom, click **PDF** → **Save as PDF**.
7. Name the PDF file with the name of the list you are printing from.

To make sure that you won’t miss anything, we recommend you print *each list* separately, starting with the default lists and then going through all your **Areas** as well as **Projects**. Even though this will duplicate some of the content, it will also ensure that everything is included in your PDF files.

If you only have the iOS apps, this print option will not be available to you, sorry. In case you have access to a Mac, you can [install a Things 3 trial version](https://culturedcode.com/things/support/articles/2803551/), connect it to your Things Cloud account to download your data, and then print it from the Mac trial app.

### Access data through Apple Shortcuts

If you’re familiar with Apple **Shortcuts**, you can use actions to get data out of Things. We do not provide a shortcut for this, so you would need to write your own. See our [technical documentation](https://culturedcode.com/things/support/articles/9596775/).

### Access data through AppleScript (Mac only)

If you are familiar with AppleScript, you can write your own script to access the data in Things 3 on your Mac. You can [download the documentation here](https://culturedcode.com/things/download/Things3AppleScriptGuide.pdf).